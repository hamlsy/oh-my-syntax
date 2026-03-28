export const TELEMETRY_URL = import.meta.env.VITE_TELEMETRY_URL ?? '';

export const COPY_REVERT_MS = 2000;
export const MAX_RESULTS = 50;
export const DEFAULT_RESULTS = 20;
export const MAX_QUERY_LENGTH = 80;

export interface Contributor {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  githubUrl: string;
  message: string;
  spawnProbability: number;
}

export const CONTRIBUTORS: Contributor[] = [
  {
    id: 'creator',
    name: 'Oh My Syntax',
    role: 'Creator',
    avatarUrl: '/assets/contributors/creator.png',
    githubUrl: 'https://github.com/ohmysyntax',
    message: "You found me 👋 — the one who made this mess.",
    spawnProbability: 1.0,
  },
];

export const FLOATING_SNIPPETS = [
  'kill -9',
  'git stash',
  'kubectl get pods',
  '=>',
  '{}',
  '[]',
  'npm run',
  '#!/bin/bash',
  'grep -r',
  'chmod 755',
  'sudo !!',
  '--force',
  'HEAD~1',
  'rebase -i',
  'CrashLoopBackOff',
  '-n default',
  'null',
  'undefined',
  '0x00',
  '404',
  'docker ps',
  'SELECT *',
  'rm -rf',
  ':wq',
  'git log',
];
