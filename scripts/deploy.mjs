#!/usr/bin/env node
/**
 * Publishes ./dist to the gh-pages branch.
 *
 * Usage: npm run deploy
 *
 * Uses whatever git credentials you already have configured for origin.
 */
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

if (!existsSync('dist/index.html')) {
  console.error('No dist/index.html found. Run `npm run build` first.')
  process.exit(1)
}

const git = (args, cwd) =>
  execFileSync('git', args, { cwd, stdio: 'inherit', env: { ...process.env } })

const remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
  encoding: 'utf8',
}).trim()

const work = mkdtempSync(join(tmpdir(), 'nextup-pages-'))

try {
  cpSync('dist', work, { recursive: true })
  // Stop GitHub Pages from running Jekyll over the build output.
  writeFileSync(join(work, '.nojekyll'), '')

  git(['init', '-b', 'gh-pages'], work)
  git(['add', '-A'], work)
  git(
    [
      '-c',
      'user.name=nextup-deploy',
      '-c',
      'user.email=nextup-deploy@users.noreply.github.com',
      'commit',
      '-m',
      `deploy ${new Date().toISOString()}`,
    ],
    work,
  )
  try {
    git(
      [
        '-c',
        'credential.helper=',
        '-c',
        'credential.helper=!gh auth git-credential',
        'push',
        '--force',
        remote,
        'gh-pages',
      ],
      work,
    )
  } catch {
    console.warn('\nFalling back to your configured git credentials...')
    git(['push', '--force', remote, 'gh-pages'], work)
  }

  console.log('\nPublished to the gh-pages branch.')
} finally {
  rmSync(work, { recursive: true, force: true })
}
