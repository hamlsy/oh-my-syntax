import type { Command } from '@/types/command';
import linuxEn from './linux.json';
import macosEn from './macos.json';
import windowsEn from './windows.json';
import dockerEn from './docker.json';
import kubernetesEn from './kubernetes.json';
import gitEn from './git.json';
import javaEn from './java.json';
import pythonEn from './python.json';
import javascriptEn from './javascript.json';
import npmEn from './npm.json';
import sqlEn from './sql.json';
import vimEn from './vim.json';

export const ALL_COMMANDS_EN: Command[] = [
  ...(linuxEn as Command[]),
  ...(macosEn as Command[]),
  ...(windowsEn as Command[]),
  ...(dockerEn as Command[]),
  ...(kubernetesEn as Command[]),
  ...(gitEn as Command[]),
  ...(javaEn as Command[]),
  ...(pythonEn as Command[]),
  ...(javascriptEn as Command[]),
  ...(npmEn as Command[]),
  ...(sqlEn as Command[]),
  ...(vimEn as Command[]),
].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
