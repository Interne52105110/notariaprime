import type { NextConfig } from "next";
import path from "path";

if (process.platform === "win32") {
  // Disque exFAT : readlink renvoie EISDIR au lieu d'EINVAL, ce qui fait
  // planter le build Next. Le shim corrige le process principal et, via
  // NODE_OPTIONS, les workers de build. Sans effet sur NTFS/ext4.
  const readlinkFix = path.join(process.cwd(), "scripts", "exfat-readlink-fix.cjs");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(readlinkFix);
  // NODE_OPTIONS interprète l'antislash comme échappement : chemin en slashs
  process.env.NODE_OPTIONS = [
    process.env.NODE_OPTIONS,
    `--require "${readlinkFix.replace(/\\/g, "/")}"`,
  ]
    .filter(Boolean)
    .join(" ");
}

const nextConfig: NextConfig = {};

export default nextConfig;
