#!/usr/bin/env node
// @ai-generated — Claude Sonnet 4.6 (Anthropic)
/**
 * Git Evidence Extractor for AI Compliance Evidence Collection Kit
 *
 * Extracts compliance-relevant evidence from a git repository's history
 * and outputs JSON compatible with the compliance-config structure used
 * by autofill.js.
 *
 * Zero external dependencies — uses only Node.js built-ins and git CLI.
 *
 * Usage:
 *   node git-evidence.js [--repo <path>] [--output <path>] [--days <N>]
 *
 * Options:
 *   --repo <path>    Path to git repository (default: current directory)
 *   --output <path>  Output file path (default: stdout)
 *   --days <N>       Number of days of history to scan (default: 365)
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveBinary } = require('./resolve-binary');
const { prepareGitSandbox } = require('./git-sandbox');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg) {
  process.stderr.write(`[git-evidence] ${msg}\n`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { repo: process.cwd(), output: null, days: 365 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--repo' && args[i + 1]) {
      opts.repo = path.resolve(args[++i]);
    } else if (args[i] === '--output' && args[i + 1]) {
      opts.output = path.resolve(args[++i]);
    } else if (args[i] === '--days' && args[i + 1]) {
      opts.days = parseInt(args[++i], 10) || 365;
    }
  }
  return opts;
}

/**
 * Validate that a repository path is safe to pass to git.
 * Rejects paths containing null bytes, which could cause argument injection
 * in git's argument parsing (CWE-88 mitigation).
 *
 * @param {string} repoPath  Resolved absolute path to validate
 * @throws {Error} if the path contains unsafe characters
 */
function validateRepoPath(repoPath) {
  if (typeof repoPath !== 'string' || repoPath.length === 0) {
    throw new Error('Repository path must be a non-empty string');
  }
  // Reject null bytes — these cannot appear in valid filesystem paths and
  // could confuse git's argument parsing on some platforms.
  if (repoPath.indexOf('\0') !== -1) {
    throw new Error('Repository path contains a null byte and cannot be used');
  }
  // Reject paths that are not absolute (path.resolve should have handled this,
  // but guard explicitly for defence-in-depth).
  if (!path.isAbsolute(repoPath)) {
    throw new Error('Repository path must be absolute: ' + repoPath);
  }
}

/**
 * Full or abbreviated hex object id. Anything that is not one of these must
 * never be placed in a git argv, because any value derived from repository
 * content (commit messages, tag names, ref names) is attacker-controlled.
 */
// 40 hex for SHA-1 repositories, 64 for SHA-256 (extensions.objectFormat).
const HASH_RE = /^[0-9a-f]{7,64}$/i;

function isHash(value) {
  return typeof value === 'string' && HASH_RE.test(value);
}

/**
 * Configuration overrides applied to every git invocation so that a
 * repository supplied by someone else cannot make git run programs on the
 * operator's machine through its own .git/config (CWE-426):
 *   core.fsmonitor   - never spawn a filesystem monitor command
 *   core.hooksPath   - point hooks at the null device so none are found
 *   diff.external    - never spawn an external diff driver
 *   protocol.allow   - no remote protocol handlers (extraction is local-only)
 */
const GIT_HARDENING = [
  '-c', 'core.fsmonitor=false',
  '-c', 'core.hooksPath=' + os.devNull,
  '-c', 'diff.external=',
  '-c', 'protocol.allow=never',
  '-c', 'log.showSignature=false',
  // Repo config could point these at any path; a UNC path on Windows sends
  // the operator's NTLM hash to that host (CWE-73). The in-tree .mailmap
  // still applies.
  '-c', 'mailmap.file=',
  '-c', 'mailmap.blob='
];

let gitFile = null;

/**
 * Absolute path of git from the operator's PATH, never from the current
 * directory, so a git.exe planted beside the scan cannot run (CWE-427).
 */
function gitBinary() {
  if (!gitFile) {
    gitFile = resolveBinary('git');
    if (!gitFile) throw new Error('git not found on PATH');
  }
  return gitFile;
}

/**
 * Signature checks (%G?) launch gpg, ssh-keygen or gpgsm. A scanned
 * repository's .git/config could name any program here (CWE-426), so each
 * is pinned to the value in the operator's own global git config, or to the
 * default program resolved from PATH. Blanking them instead made every
 * signature verify as bad.
 *
 * The SSH trust files are pinned the same way, with no default: a repo that
 * names its own allowed-signers file would otherwise vouch for its own
 * signatures (CWE-345), and either file could be a UNC path (CWE-73).
 * Signatures therefore count as good only for keys the operator trusts.
 */
const SIGNING_PROGRAMS = [
  ['gpg.program', 'gpg'],
  ['gpg.ssh.program', 'ssh-keygen'],
  ['gpg.x509.program', 'gpgsm']
];

const SIGNING_TRUST_FILES = [
  'gpg.ssh.allowedSignersFile',
  'gpg.ssh.revocationFile'
];

let signingOverrides = null;

/**
 * The operator's own value for a config key: global scope first (it takes
 * precedence), then system. --global and --system never read a repository's
 * config. --includes follows the operator's include files, so a revocation
 * list kept in one is not dropped (that would let revoked keys count).
 */
function operatorGitConfig(key) {
  for (const scope of ['--global', '--system']) {
    try {
      const value = execFileSync(gitBinary(), ['config', scope, '--includes', '--get', key], {
        cwd: os.tmpdir(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 10000,
        windowsHide: true
      }).trim();
      if (value) return value;
    } catch {
      // Key not set in this scope.
    }
  }
  return null;
}

function getSigningOverrides() {
  if (!signingOverrides) {
    signingOverrides = [];
    for (const [key, fallback] of SIGNING_PROGRAMS) {
      const program = operatorGitConfig(key) || resolveBinary(fallback) || '';
      signingOverrides.push('-c', key + '=' + program);
    }
    for (const key of SIGNING_TRUST_FILES) {
      signingOverrides.push('-c', key + '=' + (operatorGitConfig(key) || ''));
    }
  }
  return signingOverrides;
}

/**
 * Run a git command in the given repository.
 *
 * `args` is an explicit argv array. It is never split or joined, so a space
 * or quote inside a value (a date, a grep pattern, a format string) reaches
 * git as part of that one argument and can never become a second one
 * (CWE-88). repoPath is passed as the value of -C. execFileSync is used with
 * no shell, so there is no shell expansion either (CWE-78).
 */
// Environment that points git at a private git directory for the scanned
// repository (see git-sandbox.js). Set once in main() before any git call.
let sandboxEnv = null;

function git(args, repoPath) {
  if (!sandboxEnv) {
    throw new Error('git() called before the repository sandbox was prepared');
  }
  if (!Array.isArray(args)) {
    throw new Error('git() requires an argv array, not a command string');
  }
  for (const a of args) {
    if (typeof a !== 'string') {
      throw new Error('git() argv entries must be strings');
    }
  }
  const argv = ['-C', repoPath, ...GIT_HARDENING, ...getSigningOverrides(), ...args];
  return execFileSync(gitBinary(), argv, {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    timeout: 60000,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
    env: Object.assign({}, process.env, sandboxEnv)
  }).trim();
}

function gitLines(args, repoPath) {
  const out = git(args, repoPath);
  if (!out) return [];
  return out.split('\n').filter(Boolean);
}

/**
 * The commit record separator used when reading several commits in one
 * `git log` call. A NUL byte cannot appear inside a commit message, so a
 * commit body can never forge a record boundary the way a literal marker
 * line could (the previous separator was a plain word on its own line).
 */
const RECORD_SEP = '\0';

function splitRecords(out) {
  return out.split(RECORD_SEP).map(s => s.replace(/^\n/, '')).filter(Boolean);
}

function sinceArg(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return '--since=' + d.toISOString().split('T')[0];
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * True only if filePath is a regular file whose real location is inside repoPath.
 * Blocks symlinks that point at files elsewhere on the machine (CWE-59, CWE-22).
 */
function isRepoFile(repoPath, filePath) {
  try {
    const realRepo = fs.realpathSync(repoPath) + path.sep;
    const realFile = fs.realpathSync(filePath);
    if (!realFile.startsWith(realRepo)) return false;
    return fs.statSync(realFile).isFile();
  } catch {
    return false;
  }
}

function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Evidence extraction functions
// ---------------------------------------------------------------------------

function extractCodeReview(repoPath, since) {
  log('Extracting code review evidence...');
  const result = {
    totalCommits: 0,
    mergeCommits: 0,
    mergePercentage: 0,
    reviewedCommits: 0,
    uniqueReviewers: [],
    prBasedWorkflow: false
  };

  try {
    // Total commits in period
    const allHashes = gitLines(['log', since, '--format=%H'], repoPath);
    result.totalCommits = allHashes.length;

    if (result.totalCommits === 0) return result;

    // Merge commits
    const mergeHashes = gitLines(['log', since, '--merges', '--format=%H'], repoPath);
    result.mergeCommits = mergeHashes.length;
    result.mergePercentage = Math.round((result.mergeCommits / result.totalCommits) * 100);

    // Reviewed commits — look for trailers
    const trailerPatterns = [
      /Approved-by:\s*(.+)/i,
      /Reviewed-by:\s*(.+)/i,
      /Acked-by:\s*(.+)/i
    ];
    const reviewers = new Set();
    let reviewedCount = 0;

    // Get full commit messages for trailer scanning
    const commitMessages = splitRecords(git(
      ['log', since, '--format=%x00%B'],
      repoPath
    ));

    for (const msg of commitMessages) {
      let hasReview = false;
      for (const pattern of trailerPatterns) {
        const matches = msg.match(new RegExp(pattern.source, 'gim'));
        if (matches) {
          hasReview = true;
          for (const m of matches) {
            const match = m.match(pattern);
            if (match && match[1]) {
              reviewers.add(match[1].trim());
            }
          }
        }
      }
      if (hasReview) reviewedCount++;
    }

    result.reviewedCommits = reviewedCount;
    result.uniqueReviewers = [...reviewers];

    // PR-based workflow heuristic: >80% merge commits on the default branch
    result.prBasedWorkflow = result.mergePercentage > 80;
  } catch (e) {
    log(`  Warning: code review extraction partially failed: ${e.message}`);
  }

  return result;
}

function extractChangeManagement(repoPath, since, days) {
  log('Extracting change management evidence...');
  const result = {
    commitFrequency: { daily: 0, weekly: 0, monthly: 0 },
    releaseTags: [],
    releaseFrequencyDays: 0,
    conventionalCommits: { feat: 0, fix: 0, chore: 0, docs: 0, refactor: 0, test: 0, other: 0 },
    conventionalCommitPercentage: 0,
    hasChangelog: false,
    changelogLastUpdate: ''
  };

  try {
    // Commit frequency
    const totalCommits = gitLines(['log', since, '--format=%H'], repoPath).length;
    const weeksInPeriod = Math.max(1, Math.ceil(days / 7));
    const monthsInPeriod = Math.max(1, Math.ceil(days / 30));
    result.commitFrequency.daily = parseFloat((totalCommits / Math.max(1, days)).toFixed(2));
    result.commitFrequency.weekly = parseFloat((totalCommits / weeksInPeriod).toFixed(2));
    result.commitFrequency.monthly = parseFloat((totalCommits / monthsInPeriod).toFixed(2));
  } catch (e) {
    log(`  Warning: commit frequency extraction failed: ${e.message}`);
  }

  try {
    // Release tags with dates
    const tagLines = gitLines(
      ['tag', '-l', '--sort=-creatordate',
        '--format=%(refname:short)|||%(creatordate:iso-strict)|||%(objectname:short)'],
      repoPath
    );
    for (const line of tagLines) {
      const parts = line.split('|||');
      if (parts.length >= 3) {
        const tagDate = parts[1] ? parts[1].split('T')[0] : '';
        result.releaseTags.push({
          tag: parts[0],
          date: tagDate,
          commitHash: parts[2]
        });
      }
    }

    // Release frequency
    if (result.releaseTags.length >= 2) {
      const dates = result.releaseTags
        .map(t => t.date)
        .filter(Boolean)
        .map(d => new Date(d).getTime())
        .sort((a, b) => a - b);

      if (dates.length >= 2) {
        let totalInterval = 0;
        for (let i = 1; i < dates.length; i++) {
          totalInterval += dates[i] - dates[i - 1];
        }
        result.releaseFrequencyDays = Math.round(
          totalInterval / (dates.length - 1) / (1000 * 60 * 60 * 24)
        );
      }
    }
  } catch (e) {
    log(`  Warning: release tag extraction failed: ${e.message}`);
  }

  try {
    // Conventional commits analysis
    const subjects = gitLines(['log', since, '--format=%s'], repoPath);
    const conventionalRe = /^(feat|fix|chore|docs|refactor|test|ci|perf|style|build|revert)(\(.+?\))?[!]?:/i;
    let conventionalCount = 0;

    for (const subj of subjects) {
      const match = subj.match(conventionalRe);
      if (match) {
        conventionalCount++;
        const type = match[1].toLowerCase();
        if (type in result.conventionalCommits) {
          result.conventionalCommits[type]++;
        } else {
          result.conventionalCommits.other++;
        }
      } else {
        result.conventionalCommits.other++;
      }
    }

    result.conventionalCommitPercentage = subjects.length > 0
      ? Math.round((conventionalCount / subjects.length) * 100)
      : 0;
  } catch (e) {
    log(`  Warning: conventional commits analysis failed: ${e.message}`);
  }

  try {
    // Changelog presence
    const changelogNames = ['CHANGELOG.md', 'CHANGELOG', 'changelog.md', 'CHANGES.md', 'HISTORY.md'];
    for (const name of changelogNames) {
      const changelogPath = path.join(repoPath, name);
      if (isRepoFile(repoPath, changelogPath)) {
        result.hasChangelog = true;
        const stat = fs.statSync(changelogPath);
        result.changelogLastUpdate = stat.mtime.toISOString().split('T')[0];
        break;
      }
    }
  } catch (e) {
    log(`  Warning: changelog detection failed: ${e.message}`);
  }

  return result;
}

function extractAiCodeGeneration(repoPath, since) {
  log('Extracting AI code generation attribution...');
  const result = {
    aiAttributedCommits: 0,
    aiAttributionPercentage: 0,
    aiToolsDetected: [],
    topAiModifiedFiles: []
  };

  try {
    // AI-related co-author patterns
    const aiPatterns = [
      { pattern: /Co-authored-by:\s*.*\bclaude\b/i, tool: 'Claude' },
      { pattern: /Co-authored-by:\s*.*\bcopilot\b/i, tool: 'GitHub Copilot' },
      { pattern: /Co-authored-by:\s*.*\bgpt\b/i, tool: 'ChatGPT' },
      { pattern: /Co-authored-by:\s*.*\bgemini\b/i, tool: 'Gemini' },
      { pattern: /Co-authored-by:\s*.*\bcodewhisperer\b/i, tool: 'Amazon CodeWhisperer' },
      { pattern: /Co-authored-by:\s*.*\bcursor\b/i, tool: 'Cursor' },
      { pattern: /Co-authored-by:\s*.*\btabnine\b/i, tool: 'Tabnine' },
      { pattern: /Co-authored-by:\s*.*\banthrop/i, tool: 'Claude' },
      { pattern: /Co-authored-by:\s*.*\bopenai\b/i, tool: 'ChatGPT' },
      { pattern: /Co-authored-by:\s*.*\bdeepseek\b/i, tool: 'DeepSeek' },
      { pattern: /Co-authored-by:\s*.*\bmistral\b/i, tool: 'Mistral' },
      { pattern: /Co-authored-by:\s*.*noreply@anthropic\.com/i, tool: 'Claude' },
      { pattern: /Co-authored-by:\s*.*noreply@github\.com.*copilot/i, tool: 'GitHub Copilot' }
    ];

    const toolCounts = {};
    const aiCommitHashes = [];

    // Get commit messages with hashes
    // NUL-separated records: a commit body cannot contain NUL, so it cannot
    // forge a record whose first line would be taken as a hash.
    const commitData = splitRecords(git(
      ['log', since, '--format=%x00%H%n%B'],
      repoPath
    ));

    const totalCommits = commitData.length;

    for (const block of commitData) {
      const lines = block.split('\n');
      const hash = lines[0];
      const body = lines.slice(1).join('\n');
      // Defence in depth: only a hex object id may ever reach a git argv.
      if (!isHash(hash)) continue;

      // Several patterns can name the same tool (a Claude trailer matches "claude",
      // "anthrop" and noreply@anthropic.com), so count each tool once per commit.
      const toolsInCommit = new Set();
      for (const { pattern, tool } of aiPatterns) {
        if (pattern.test(body)) toolsInCommit.add(tool);
      }
      for (const tool of toolsInCommit) {
        toolCounts[tool] = (toolCounts[tool] || 0) + 1;
      }
      const isAi = toolsInCommit.size > 0;

      if (isAi) {
        aiCommitHashes.push(hash);
      }
    }

    result.aiAttributedCommits = aiCommitHashes.length;
    result.aiAttributionPercentage = totalCommits > 0
      ? Math.round((aiCommitHashes.length / totalCommits) * 100)
      : 0;

    result.aiToolsDetected = Object.entries(toolCounts)
      .map(([tool, commits]) => ({ tool, commits }))
      .sort((a, b) => b.commits - a.commits);

    // Top files modified in AI-attributed commits
    if (aiCommitHashes.length > 0) {
      const fileCounts = {};
      // Process in batches to avoid command line length limits
      const batchSize = 50;
      for (let i = 0; i < aiCommitHashes.length; i += batchSize) {
        const batch = aiCommitHashes.slice(i, i + batchSize);
        for (const hash of batch) {
          try {
            // hash passed isHash() (hex only), so it cannot be read as an option.
            // It must come before -- or git treats it as a path. --root lists
            // the files of a root commit, which has no parent to diff against.
            const files = gitLines(['diff-tree', '--no-commit-id', '--name-only', '-r', '--root', hash, '--'], repoPath);
            for (const f of files) {
              fileCounts[f] = (fileCounts[f] || 0) + 1;
            }
          } catch {
            // Skip commits git cannot read (e.g. a shallow clone boundary)
          }
        }
      }

      result.topAiModifiedFiles = Object.entries(fileCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([file, count]) => ({ file, commits: count }));
    }
  } catch (e) {
    log(`  Warning: AI code generation extraction failed: ${e.message}`);
  }

  return result;
}

function extractSecurityPractices(repoPath, since) {
  log('Extracting security practices evidence...');
  const result = {
    gitignoreExcludesSecrets: false,
    gitignoreSecretPatterns: [],
    securityFiles: {
      'SECURITY.md': false,
      'CODEOWNERS': false,
      'dependabot.yml': false,
      '.github/security.yml': false,
      '.github/CODEOWNERS': false
    },
    securityWorkflows: [],
    hasPreCommitHooks: false,
    hookTools: [],
    signedCommits: 0,
    signedPercentage: 0
  };

  try {
    // .gitignore analysis
    const gitignorePath = path.join(repoPath, '.gitignore');
    if (fileExists(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      const secretPatterns = [
        { pattern: /\.env/m, name: '.env' },
        { pattern: /\.env\.\*/m, name: '.env.*' },
        { pattern: /\.env\.local/m, name: '.env.local' },
        { pattern: /credentials/i, name: 'credentials' },
        { pattern: /\.key$/m, name: '*.key' },
        { pattern: /\.pem$/m, name: '*.pem' },
        { pattern: /secret/i, name: 'secrets' },
        { pattern: /\.p12$/m, name: '*.p12' },
        { pattern: /\.pfx$/m, name: '*.pfx' },
        { pattern: /id_rsa/m, name: 'id_rsa' },
        { pattern: /\.keystore/m, name: '.keystore' },
        { pattern: /token/i, name: 'tokens' },
        { pattern: /password/i, name: 'passwords' },
        { pattern: /\.aws/m, name: '.aws' }
      ];

      for (const { pattern, name } of secretPatterns) {
        if (pattern.test(content)) {
          result.gitignoreSecretPatterns.push(name);
        }
      }
      result.gitignoreExcludesSecrets = result.gitignoreSecretPatterns.length > 0;
    }
  } catch (e) {
    log(`  Warning: .gitignore analysis failed: ${e.message}`);
  }

  try {
    // Security-related files
    const filesToCheck = {
      'SECURITY.md': [
        path.join(repoPath, 'SECURITY.md'),
        path.join(repoPath, 'security.md'),
        path.join(repoPath, '.github', 'SECURITY.md')
      ],
      'CODEOWNERS': [
        path.join(repoPath, 'CODEOWNERS'),
        path.join(repoPath, '.github', 'CODEOWNERS'),
        path.join(repoPath, 'docs', 'CODEOWNERS')
      ],
      'dependabot.yml': [
        path.join(repoPath, '.github', 'dependabot.yml'),
        path.join(repoPath, '.github', 'dependabot.yaml')
      ],
      '.github/security.yml': [
        path.join(repoPath, '.github', 'security.yml'),
        path.join(repoPath, '.github', 'security.yaml')
      ],
      '.github/CODEOWNERS': [
        path.join(repoPath, '.github', 'CODEOWNERS')
      ]
    };

    for (const [key, paths] of Object.entries(filesToCheck)) {
      for (const p of paths) {
        if (fileExists(p)) {
          result.securityFiles[key] = true;
          break;
        }
      }
    }

    // Security workflows
    const workflowDir = path.join(repoPath, '.github', 'workflows');
    if (dirExists(workflowDir)) {
      try {
        const workflows = fs.readdirSync(workflowDir);
        result.securityWorkflows = workflows.filter(f =>
          /secur|codeql|snyk|trivy|scan|dependabot|audit|sast|dast/i.test(f)
        );
      } catch {
        // Ignore directory read failures
      }
    }
  } catch (e) {
    log(`  Warning: security file detection failed: ${e.message}`);
  }

  try {
    // Git hooks
    const hookToolNames = [];

    // Check .husky
    const huskyDir = path.join(repoPath, '.husky');
    if (dirExists(huskyDir)) {
      result.hasPreCommitHooks = true;
      hookToolNames.push('husky');
    }

    // Check .pre-commit-config.yaml
    if (fileExists(path.join(repoPath, '.pre-commit-config.yaml'))) {
      result.hasPreCommitHooks = true;
      hookToolNames.push('pre-commit');
    }

    // Check .lefthook.yml
    if (fileExists(path.join(repoPath, '.lefthook.yml')) || fileExists(path.join(repoPath, 'lefthook.yml'))) {
      result.hasPreCommitHooks = true;
      hookToolNames.push('lefthook');
    }

    // Check .git/hooks for non-sample hooks
    const gitHooksDir = path.join(repoPath, '.git', 'hooks');
    if (dirExists(gitHooksDir)) {
      try {
        const hooks = fs.readdirSync(gitHooksDir);
        const activeHooks = hooks.filter(f => !f.endsWith('.sample'));
        if (activeHooks.length > 0) {
          result.hasPreCommitHooks = true;
          if (!hookToolNames.length) hookToolNames.push('git-hooks');
        }
      } catch {
        // Ignore
      }
    }

    // Check package.json for lint-staged / husky config
    const pkgPath = path.join(repoPath, 'package.json');
    if (fileExists(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg['lint-staged']) {
          result.hasPreCommitHooks = true;
          if (!hookToolNames.includes('lint-staged')) hookToolNames.push('lint-staged');
        }
        if (pkg.husky) {
          result.hasPreCommitHooks = true;
          if (!hookToolNames.includes('husky')) hookToolNames.push('husky');
        }
      } catch {
        // Ignore parse failures
      }
    }

    result.hookTools = [...new Set(hookToolNames)];
  } catch (e) {
    log(`  Warning: hook detection failed: ${e.message}`);
  }

  try {
    // Signed commits
    const sigLines = gitLines(['log', since, '--format=%G?'], repoPath);
    // Only 'G' (good signature) counts. 'U' (unknown trust) and 'E' (unverifiable) do not prove authorship.
    const signed = sigLines.filter(s => s === 'G').length;
    result.signedCommits = signed;
    result.signedPercentage = sigLines.length > 0
      ? Math.round((signed / sigLines.length) * 100)
      : 0;
  } catch (e) {
    log(`  Warning: signed commit detection failed: ${e.message}`);
  }

  return result;
}

function extractIncidentResponse(repoPath, since) {
  log('Extracting incident response evidence...');
  const result = {
    hotfixBranches: [],
    revertCommits: 0,
    revertDetails: [],
    avgReleaseIntervalDays: 0
  };

  try {
    // Hotfix/emergency branches
    const branchLines = gitLines(['branch', '-a'], repoPath);
    const hotfixPatterns = /\b(hotfix|bugfix|emergency|patch|urgent)\b/i;
    for (const line of branchLines) {
      const name = line.replace(/^\*?\s+/, '').replace(/^remotes\/origin\//, '').trim();
      if (hotfixPatterns.test(name)) {
        result.hotfixBranches.push(name);
      }
    }
    // Deduplicate
    result.hotfixBranches = [...new Set(result.hotfixBranches)];
  } catch (e) {
    log(`  Warning: hotfix branch detection failed: ${e.message}`);
  }

  try {
    // Revert commits
    const revertLines = gitLines(['log', since, '--format=%H|||%s', '--grep=^Revert '], repoPath);
    result.revertCommits = revertLines.length;
    result.revertDetails = revertLines.slice(0, 50).map(line => {
      const parts = line.split('|||');
      return { hash: parts[0], subject: parts[1] || '' };
    });
  } catch (e) {
    log(`  Warning: revert commit detection failed: ${e.message}`);
  }

  try {
    // Average release interval (from tags)
    const tagDateLines = gitLines(
      ['tag', '-l', '--sort=-creatordate', '--format=%(creatordate:iso-strict)'],
      repoPath
    );
    const tagDates = tagDateLines
      .map(d => new Date(d).getTime())
      .filter(d => !isNaN(d))
      .sort((a, b) => a - b);

    if (tagDates.length >= 2) {
      let totalInterval = 0;
      for (let i = 1; i < tagDates.length; i++) {
        totalInterval += tagDates[i] - tagDates[i - 1];
      }
      result.avgReleaseIntervalDays = Math.round(
        totalInterval / (tagDates.length - 1) / (1000 * 60 * 60 * 24)
      );
    }
  } catch (e) {
    log(`  Warning: release interval calculation failed: ${e.message}`);
  }

  return result;
}

function extractGovernance(repoPath) {
  log('Extracting governance structure evidence...');
  const result = {
    codeowners: [],
    hasContributing: false,
    hasLicense: false,
    licenseType: '',
    uniqueContributors: 0,
    contributorList: []
  };

  try {
    // CODEOWNERS
    const codeownersPaths = [
      path.join(repoPath, 'CODEOWNERS'),
      path.join(repoPath, '.github', 'CODEOWNERS'),
      path.join(repoPath, 'docs', 'CODEOWNERS')
    ];

    for (const coPath of codeownersPaths) {
      if (isRepoFile(repoPath, coPath)) {
        const content = fs.readFileSync(coPath, 'utf8');
        const lines = content.split('\n')
          .filter(l => l.trim() && !l.trim().startsWith('#'));

        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            result.codeowners.push({
              pattern: parts[0],
              owners: parts.slice(1)
            });
          }
        }
        break;
      }
    }
  } catch (e) {
    log(`  Warning: CODEOWNERS parsing failed: ${e.message}`);
  }

  try {
    // Contributing guidelines
    const contributingNames = ['CONTRIBUTING.md', 'CONTRIBUTING', 'contributing.md', '.github/CONTRIBUTING.md'];
    for (const name of contributingNames) {
      if (isRepoFile(repoPath, path.join(repoPath, name))) {
        result.hasContributing = true;
        break;
      }
    }
  } catch (e) {
    log(`  Warning: contributing file detection failed: ${e.message}`);
  }

  try {
    // License
    const licenseNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md', 'license'];
    for (const name of licenseNames) {
      const lPath = path.join(repoPath, name);
      if (isRepoFile(repoPath, lPath)) {
        result.hasLicense = true;
        // Try to detect license type from first few lines
        const content = fs.readFileSync(lPath, 'utf8').slice(0, 2000);
        const licensePatterns = [
          { pattern: /MIT License/i, type: 'MIT' },
          { pattern: /Apache License.*2\.0/i, type: 'Apache-2.0' },
          { pattern: /GNU GENERAL PUBLIC LICENSE\s+Version 3/i, type: 'GPL-3.0' },
          { pattern: /GNU GENERAL PUBLIC LICENSE\s+Version 2/i, type: 'GPL-2.0' },
          { pattern: /GNU LESSER GENERAL PUBLIC/i, type: 'LGPL' },
          { pattern: /BSD 2-Clause/i, type: 'BSD-2-Clause' },
          { pattern: /BSD 3-Clause/i, type: 'BSD-3-Clause' },
          { pattern: /ISC License/i, type: 'ISC' },
          { pattern: /Mozilla Public License.*2\.0/i, type: 'MPL-2.0' },
          { pattern: /The Unlicense/i, type: 'Unlicense' },
          { pattern: /Creative Commons/i, type: 'CC' },
          { pattern: /AGPL/i, type: 'AGPL' },
          { pattern: /Boost Software License/i, type: 'BSL-1.0' }
        ];
        for (const { pattern, type } of licensePatterns) {
          if (pattern.test(content)) {
            result.licenseType = type;
            break;
          }
        }
        if (!result.licenseType) result.licenseType = 'Unknown';
        break;
      }
    }
  } catch (e) {
    log(`  Warning: license detection failed: ${e.message}`);
  }

  try {
    // Contributors
    const authorLines = gitLines(['log', '--format=%aN|||%aE'], repoPath);
    const contributors = new Map();
    for (const line of authorLines) {
      const parts = line.split('|||');
      const name = parts[0];
      const email = parts[1] || '';
      const key = email || name;
      if (!contributors.has(key)) {
        contributors.set(key, { name, email });
      }
    }
    result.uniqueContributors = contributors.size;
    result.contributorList = [...contributors.values()].slice(0, 100);
  } catch (e) {
    log(`  Warning: contributor extraction failed: ${e.message}`);
  }

  return result;
}

function extractAccessControl(repoPath, since) {
  log('Extracting access control evidence...');
  const result = {
    uniqueCommitterEmails: [],
    authorCommitterMismatches: 0
  };

  try {
    // Unique committer emails
    const committerEmails = gitLines(['log', since, '--format=%cE'], repoPath);
    result.uniqueCommitterEmails = [...new Set(committerEmails)].filter(Boolean);
  } catch (e) {
    log(`  Warning: committer email extraction failed: ${e.message}`);
  }

  try {
    // Author vs committer mismatches
    const lines = gitLines(['log', since, '--format=%aE|||%cE'], repoPath);
    let mismatches = 0;
    for (const line of lines) {
      const parts = line.split('|||');
      if (parts[0] && parts[1] && parts[0] !== parts[1]) {
        mismatches++;
      }
    }
    result.authorCommitterMismatches = mismatches;
  } catch (e) {
    log(`  Warning: author/committer mismatch detection failed: ${e.message}`);
  }

  return result;
}

// ---------------------------------------------------------------------------
// AutoFill field computation
// ---------------------------------------------------------------------------

function computeAutoFillFields(evidence) {
  log('Computing auto-fill fields...');
  const fields = {};

  // AI attribution supply chain risk
  if (evidence.aiCodeGeneration.aiAttributedCommits > 0) {
    const tools = evidence.aiCodeGeneration.aiToolsDetected
      .map(t => `${t.tool} (${t.commits} commits)`)
      .join(', ');
    fields['supplyChain.aiCodeGenerationDetected'] = true;
    fields['supplyChain.aiToolsUsed'] = tools;
    fields['supplyChain.aiAttributionPercentage'] = evidence.aiCodeGeneration.aiAttributionPercentage;
    fields['supplyChain.note'] = `AI-assisted code generation detected in ${evidence.aiCodeGeneration.aiAttributionPercentage}% of commits. Tools: ${tools}. Review supply chain documentation requirements.`;
  }

  // PR-based workflow as human oversight evidence
  if (evidence.codeReview.mergePercentage > 80) {
    fields['humanOversight.prBasedWorkflow'] = true;
    fields['humanOversight.mergePercentage'] = evidence.codeReview.mergePercentage;
    fields['humanOversight.note'] = `Repository uses PR-based workflow (${evidence.codeReview.mergePercentage}% merge commits). ${evidence.codeReview.uniqueReviewers.length} unique reviewers identified. This evidences human oversight of code changes.`;
  }

  // Commit signing as security control
  if (evidence.securityPractices.signedPercentage > 50) {
    fields['security.commitSigningEnabled'] = true;
    fields['security.signedPercentage'] = evidence.securityPractices.signedPercentage;
    fields['security.note'] = `${evidence.securityPractices.signedPercentage}% of commits are cryptographically signed, evidencing commit authenticity verification as a security control.`;
  }

  // CODEOWNERS as governance evidence
  if (evidence.governance.codeowners.length > 0) {
    const ownerSummary = evidence.governance.codeowners
      .slice(0, 10)
      .map(c => `${c.pattern}: ${c.owners.join(', ')}`)
      .join('; ');
    fields['governance.codeownersPresent'] = true;
    fields['governance.codeownersSummary'] = ownerSummary;
    fields['governance.note'] = `CODEOWNERS file defines ${evidence.governance.codeowners.length} ownership rule(s), evidencing code governance structure.`;
  }

  // Conventional commits as change management evidence
  if (evidence.changeManagement.conventionalCommitPercentage > 50) {
    fields['changeManagement.conventionalCommitsUsed'] = true;
    fields['changeManagement.conventionalCommitPercentage'] = evidence.changeManagement.conventionalCommitPercentage;
    fields['changeManagement.note'] = `${evidence.changeManagement.conventionalCommitPercentage}% of commits follow conventional commit format, evidencing structured change management practices.`;
  }

  // Gitignore secrets exclusion as security evidence
  if (evidence.securityPractices.gitignoreExcludesSecrets) {
    fields['security.secretsExcluded'] = true;
    fields['security.excludedPatterns'] = evidence.securityPractices.gitignoreSecretPatterns.join(', ');
  }

  // Pre-commit hooks as security/quality evidence
  if (evidence.securityPractices.hasPreCommitHooks) {
    fields['security.preCommitHooksEnabled'] = true;
    fields['security.hookTools'] = evidence.securityPractices.hookTools.join(', ');
  }

  // License as governance evidence
  if (evidence.governance.hasLicense) {
    fields['governance.licensePresent'] = true;
    fields['governance.licenseType'] = evidence.governance.licenseType;
  }

  // Contributing guidelines as governance evidence
  if (evidence.governance.hasContributing) {
    fields['governance.contributingGuidelinesPresent'] = true;
  }

  // Incident response from revert/hotfix history
  if (evidence.incidentResponse.revertCommits > 0 || evidence.incidentResponse.hotfixBranches.length > 0) {
    fields['incidentResponse.evidencePresent'] = true;
    fields['incidentResponse.revertCount'] = evidence.incidentResponse.revertCommits;
    fields['incidentResponse.hotfixBranchCount'] = evidence.incidentResponse.hotfixBranches.length;
    fields['incidentResponse.note'] = `${evidence.incidentResponse.revertCommits} revert commit(s) and ${evidence.incidentResponse.hotfixBranches.length} hotfix/emergency branch(es) detected, evidencing incident response processes.`;
  }

  // Release management evidence
  if (evidence.changeManagement.releaseTags.length > 0) {
    fields['changeManagement.releaseTagCount'] = evidence.changeManagement.releaseTags.length;
    fields['changeManagement.latestRelease'] = evidence.changeManagement.releaseTags[0]?.tag || '';
    if (evidence.changeManagement.releaseFrequencyDays > 0) {
      fields['changeManagement.releaseFrequencyDays'] = evidence.changeManagement.releaseFrequencyDays;
    }
  }

  // Contributor count as access control evidence
  fields['accessControl.uniqueContributors'] = evidence.governance.uniqueContributors;
  fields['accessControl.uniqueCommitters'] = evidence.accessControl.uniqueCommitterEmails.length;
  if (evidence.accessControl.authorCommitterMismatches > 0) {
    fields['accessControl.authorCommitterMismatches'] = evidence.accessControl.authorCommitterMismatches;
    fields['accessControl.note'] = `${evidence.accessControl.authorCommitterMismatches} commits have author/committer mismatches, indicating use of rebasing or merge policies.`;
  }

  return fields;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const opts = parseArgs();

  // CWE-88: validate repo path before passing to git (null byte / non-absolute check)
  try {
    validateRepoPath(opts.repo);
  } catch (e) {
    process.stderr.write(`[git-evidence] Error: ${e.message}\n`);
    process.exit(1);
  }

  log(`Repository: ${opts.repo}`);
  log(`Days of history: ${opts.days}`);
  log(`Output: ${opts.output || 'stdout'}`);
  log('');

  // git never reads the scanned repository's own config: it runs against a
  // private git directory (CWE-73). Layouts that cannot be handled safely
  // are refused before the first git call.
  const sandbox = prepareGitSandbox(opts.repo);
  if (!sandbox.ok) {
    process.stderr.write(`Error: refusing to run git on "${opts.repo}": ${sandbox.reason}.\n`);
    process.exit(2);
  }
  sandboxEnv = sandbox.env;
  process.on('exit', sandbox.cleanup);

  // Verify this is a git repository
  try {
    git(['rev-parse', '--git-dir'], opts.repo);
  } catch {
    process.stderr.write(`Error: "${opts.repo}" is not a git repository.\n`);
    process.exit(1);
  }

  const since = sinceArg(opts.days);

  // Run all extractions
  const codeReview = extractCodeReview(opts.repo, since);
  const changeManagement = extractChangeManagement(opts.repo, since, opts.days);
  const aiCodeGeneration = extractAiCodeGeneration(opts.repo, since);
  const securityPractices = extractSecurityPractices(opts.repo, since);
  const incidentResponse = extractIncidentResponse(opts.repo, since);
  const governance = extractGovernance(opts.repo);
  const accessControl = extractAccessControl(opts.repo, since);

  const evidence = {
    codeReview,
    changeManagement,
    aiCodeGeneration,
    securityPractices,
    incidentResponse,
    governance,
    accessControl
  };

  const autoFillFields = computeAutoFillFields(evidence);

  const output = {
    _meta: {
      extractor: 'git-evidence',
      version: '1.0.0',
      extractedAt: new Date().toISOString(),
      repoPath: opts.repo,
      daysCovered: opts.days
    },
    ...evidence,
    autoFillFields
  };

  const json = JSON.stringify(output, null, 2);

  if (opts.output) {
    const outDir = path.dirname(opts.output);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(opts.output, json, 'utf8');
    log(`\nOutput written to: ${opts.output}`);
  } else {
    process.stdout.write(json + '\n');
  }

  // Summary to stderr
  log('');
  log('=== Extraction Summary ===');
  log(`Total commits scanned: ${codeReview.totalCommits}`);
  log(`Merge commits: ${codeReview.mergeCommits} (${codeReview.mergePercentage}%)`);
  log(`Reviewed commits: ${codeReview.reviewedCommits}`);
  log(`AI-attributed commits: ${aiCodeGeneration.aiAttributedCommits} (${aiCodeGeneration.aiAttributionPercentage}%)`);
  log(`Release tags: ${changeManagement.releaseTags.length}`);
  log(`Conventional commits: ${changeManagement.conventionalCommitPercentage}%`);
  log(`Signed commits: ${securityPractices.signedCommits} (${securityPractices.signedPercentage}%)`);
  log(`Unique contributors: ${governance.uniqueContributors}`);
  log(`Revert commits: ${incidentResponse.revertCommits}`);
  log(`Hotfix branches: ${incidentResponse.hotfixBranches.length}`);
  log(`CODEOWNERS rules: ${governance.codeowners.length}`);
  log(`Auto-fill fields generated: ${Object.keys(autoFillFields).length}`);
  log('=== Done ===');
}

main();
