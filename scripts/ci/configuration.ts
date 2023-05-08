import * as fs from 'fs';

interface ConfigRepository {
  url: string;
  syncs: string[];
}

interface ConfigRoot {
  repositories: ConfigRepository[];
}

class ConfigReader {
  static read(configPath: string): ConfigRoot {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data) as ConfigRoot;
  }
}

export { ConfigReader, ConfigRoot, ConfigRepository };
