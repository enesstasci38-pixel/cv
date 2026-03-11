const { spawn } = require('child_process');

const env = { ...process.env, API_KEY: 'c0a77c121e20054d163d81585f41423a79f296d1381b3e5fe924bfd65fcc2e4e' };
const child = spawn('npx', ['-y', '@21st-dev/magic@latest'], { env, shell: true });

const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
};

child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const resp = JSON.parse(line);
            if (resp.id === 1) {
                console.log(JSON.stringify(resp, null, 2));
                child.kill();
                process.exit();
            }
        } catch (e) { }
    }
});

child.stderr.on('data', (data) => {
    console.error('err:', data.toString());
});

child.stdin.write(JSON.stringify(request) + '\n');
