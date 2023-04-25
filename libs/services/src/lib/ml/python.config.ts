import { Options } from 'python-shell'
import { Logger } from '@nestjs/common'

const logger = new Logger('PythonShell')

export const pythonShellOptions: Options = {
  mode: 'text',
  pythonPath: process.env.PYTHON_PATH || 'c://Users//bodew//miniconda3//envs//torch//python.exe',
  scriptPath: './libs/services/src/lib/ml/scripts',
  pythonOptions: ['-u'], // get print results in real-time
  stderrParser: (stderr: string) => {
    logger.verbose(stderr)
    return stderr
  },
}
