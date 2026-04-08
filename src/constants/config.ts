export const TELEMETRY_URL = import.meta.env.VITE_TELEMETRY_URL ?? '';

export const COPY_REVERT_MS = 2000;
export const MAX_RESULTS = 50;
export const DEFAULT_RESULTS = 20;
export const MAX_QUERY_LENGTH = 80;
export const MAX_RECENT_COMMANDS = 10;
export const RECENT_COPY_REVERT_MS = 800;

export interface Contributor {
  id: string;
  name: string;
  role: typeof ContributorRole[keyof typeof ContributorRole];
  color: string;
  githubUrl: string;
  message: string;
  spawnProbability: number;
}

export const ContributorRole = {
  Creator: 'Creator',
  Maintainer: 'Maintainer',
  Contributor: 'Contributor',
  Designer: 'Designer',
  Translator: 'Translator',
} as const;

export const CONTRIBUTORS: Contributor[] = [
  {
    id: 'creatora',
    name: 'hamlsy',
    role: ContributorRole.Creator,
    color: '#7c3aed',
    githubUrl: 'https://github.com/hamlsy',
    message: "You found me 👋 — the one who made this mess.",
    spawnProbability: 1.0,
  },
  // {
  //   id: 'dummy-1',
  //   name: 'alice_dev',
  //   role: ContributorRole.Maintainer,
  //   color: '#2563eb',
  //   githubUrl: 'https://github.com/hamlsy',
  //   message: "Keeping the lights on, one PR at a time.",
  //   spawnProbability: 0.8,
  // },
  // {
  //   id: 'dummy-2',
  //   name: 'bob_codes',
  //   role: ContributorRole.Contributor,
  //   color: '#059669',
  //   githubUrl: 'https://github.com/hamlsy',
  //   message: "Fixed that one bug you never noticed.",
  //   spawnProbability: 0.7,
  // },
  // {
  //   id: 'dummy-3',
  //   name: 'carol_ui',
  //   role: ContributorRole.Designer,
  //   color: '#db2777',
  //   githubUrl: 'https://github.com/hamlsy',
  //   message: "Pixels pushed with love.",
  //   spawnProbability: 0.75,
  // },
  // {
  //   id: 'dummy-4',
  //   name: 'dave_i18n',
  //   role: ContributorRole.Translator,
  //   color: '#d97706',
  //   githubUrl: 'https://github.com/hamlsy',
  //   message: "言語の壁を壊す。Breaking language barriers.",
  //   spawnProbability: 0.6,
  // },
  // {
  //   id: 'dummy-5',
  //   name: 'eve_hacks',
  //   role: ContributorRole.Contributor,
  //   color: '#0891b2',
  //   githubUrl: 'https://github.com/hamlsy',
  //   message: "rm -rf bugs && git push --force",
  //   spawnProbability: 0.65,
  // },
  // {
  //   id: 'dummy-6',
  //   name: 'frank_ops',
  //   role: ContributorRole.Maintainer,
  //   color: '#65a30d',
  //   githubUrl: 'https://github.com/hamlsy',
  //   message: "kubectl apply -f my-soul.yaml",
  //   spawnProbability: 0.7,
  // },
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
