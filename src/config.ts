export type ConfigValue = string;

export type Manifest = { manifest: true };
export type Storage = { storage: true };
export type Registry = { registry: true };

export type Configurable =
    Manifest | Storage | Registry |
      Manifest & Storage |
      Manifest & Registry |
      Storage & Registry |
      Manifest & Storage & Registry

export type Config<T extends Configurable> = {
  [K in keyof T]: ConfigValue
} & { [k: string]: ConfigValue };


