// Run with: npx tsx scripts/validate-data.ts
import { ALL_COMMANDS_EN } from '../src/data/en/index';
import linuxKo from '../src/data/ko/linux.json';
import macosKo from '../src/data/ko/macos.json';
import windowsKo from '../src/data/ko/windows.json';
import dockerKo from '../src/data/ko/docker.json';
import kubernetesKo from '../src/data/ko/kubernetes.json';
import gitKo from '../src/data/ko/git.json';
import javaKo from '../src/data/ko/java.json';
import pythonKo from '../src/data/ko/python.json';
import javascriptKo from '../src/data/ko/javascript.json';

interface KoEntry { id: string }

const enIds = new Set(ALL_COMMANDS_EN.map(c => c.id));
const koEntries: KoEntry[] = [
  ...(linuxKo as KoEntry[]),
  ...(macosKo as KoEntry[]),
  ...(windowsKo as KoEntry[]),
  ...(dockerKo as KoEntry[]),
  ...(kubernetesKo as KoEntry[]),
  ...(gitKo as KoEntry[]),
  ...(javaKo as KoEntry[]),
  ...(pythonKo as KoEntry[]),
  ...(javascriptKo as KoEntry[]),
];
const koIds = new Set(koEntries.map(c => c.id));

const missingInKo = [...enIds].filter(id => !koIds.has(id));
const orphansInKo  = [...koIds].filter(id => !enIds.has(id));

if (missingInKo.length) {
  console.error('❌ KO translation missing for:', missingInKo);
  process.exit(1);
}
if (orphansInKo.length) {
  console.warn('⚠️  KO has orphan entries (no EN counterpart):', orphansInKo);
}
console.log(`✅ EN/KO parity OK — ${enIds.size} commands all translated.`);
