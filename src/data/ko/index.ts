import type { Command } from '@/types/command';
import { ALL_COMMANDS_EN } from '../en';
import linuxKo from './linux.json';
import macosKo from './macos.json';
import windowsKo from './windows.json';
import dockerKo from './docker.json';
import kubernetesKo from './kubernetes.json';
import gitKo from './git.json';
import javaKo from './java.json';
import pythonKo from './python.json';
import javascriptKo from './javascript.json';
import npmKo from './npm.json';
import sqlKo from './sql.json';
import vimKo from './vim.json';

interface CommandLocale {
  id: string;
  title: string;
  description: string;
  aliases: string[];
}

const allKo: CommandLocale[] = [
  ...(linuxKo as CommandLocale[]),
  ...(macosKo as CommandLocale[]),
  ...(windowsKo as CommandLocale[]),
  ...(dockerKo as CommandLocale[]),
  ...(kubernetesKo as CommandLocale[]),
  ...(gitKo as CommandLocale[]),
  ...(javaKo as CommandLocale[]),
  ...(pythonKo as CommandLocale[]),
  ...(javascriptKo as CommandLocale[]),
  ...(npmKo as CommandLocale[]),
  ...(sqlKo as CommandLocale[]),
  ...(vimKo as CommandLocale[]),
];

const KO_MAP = new Map<string, CommandLocale>(allKo.map(k => [k.id, k]));

export const ALL_COMMANDS_KO: Command[] = ALL_COMMANDS_EN.map(cmd => {
  const ko = KO_MAP.get(cmd.id);
  if (!ko) return cmd;
  return { ...cmd, title: ko.title, description: ko.description, aliases: ko.aliases };
});
