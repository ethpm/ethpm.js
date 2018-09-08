export type ConfigValue = string;

export type Manifest = { manifest: true };
export type Storage = { storage: true };
export type Registry = { registry: true };

export type Config =
    Manifest | Storage | Registry |
      Manifest & Storage |
      Manifest & Registry |
      Storage & Registry |
      Manifest & Storage & Registry

export type RawConfig<T extends Config> = {
  [K in keyof T]: ConfigValue
} & { [k: string]: ConfigValue };


