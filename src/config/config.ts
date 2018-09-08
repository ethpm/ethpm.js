/**
 * @module "ethpm/config"
 */

export type ConfigValue = string;

export type HasManifest = { manifest: true };
export type HasStorage = { storage: true };
export type HasRegistry = { registry: true };

export type Config =
    HasManifest | HasStorage | HasRegistry |
      HasManifest & HasStorage |
      HasManifest & HasRegistry |
      HasStorage & HasRegistry |
      HasManifest & HasStorage & HasRegistry

export type RawConfig<T extends Config> = {
  [K in keyof T]: ConfigValue
} & { [k: string]: ConfigValue };
