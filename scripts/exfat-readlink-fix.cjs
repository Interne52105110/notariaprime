// Sur un disque exFAT (ex. SSD externe T7), fs.readlink sur un fichier
// ordinaire échoue avec EISDIR au lieu d'EINVAL comme sur NTFS/ext4.
// Next.js (webpack, @vercel/nft) ne gère qu'EINVAL et fait planter le build.
// Ce shim remappe l'erreur pour retrouver le comportement standard.
'use strict';
const fs = require('fs');

function remap(err) {
  if (err && err.code === 'EISDIR' && err.syscall === 'readlink') {
    const e = new Error(`EINVAL: invalid argument, readlink '${err.path}'`);
    e.code = 'EINVAL';
    e.errno = -4071; // UV_EINVAL sur Windows
    e.syscall = 'readlink';
    e.path = err.path;
    return e;
  }
  return err;
}

const origSync = fs.readlinkSync;
fs.readlinkSync = function (...args) {
  try {
    return origSync.apply(fs, args);
  } catch (err) {
    throw remap(err);
  }
};

const orig = fs.readlink;
fs.readlink = function (...args) {
  const cb = args[args.length - 1];
  if (typeof cb === 'function') {
    args[args.length - 1] = (err, res) => cb(err ? remap(err) : err, res);
  }
  return orig.apply(fs, args);
};

const origPromise = fs.promises.readlink;
fs.promises.readlink = async function (...args) {
  try {
    return await origPromise.apply(fs.promises, args);
  } catch (err) {
    throw remap(err);
  }
};
