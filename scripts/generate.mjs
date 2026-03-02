const [type, name] = process.argv.slice(2);

const map = {
  s: { generator: 'service', suffix: '.service' },
  c: { generator: 'component', suffix: '.component' },
  g: { generator: 'guard', suffix: '.guard' },
  i: { generator: 'interceptor', suffix: '.interceptor' },
  p: { generator: 'pipe', suffix: '.pipe' },
};

const { generator, suffix } = map[type];
const { execSync } = await import('child_process');

execSync(`nx g @nx/angular:${generator} ${name}${suffix} --project=frontend`, {
  stdio: 'inherit',
});

//npm run g s core/auth/auth
// npm run g c features/home/home
