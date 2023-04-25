import { Global, Module } from '@nestjs/common'
import { ip } from 'address'
import { Md5 } from 'ts-md5'

@Global()
@Module({
  providers: [
    {
      provide: 'NODE_NAME',
      useValue: generateNodeName(),
    },
  ],
  exports: ['NODE_NAME'],
})
export class ConstantsModule {}

function generateNodeName(): string {
  const ipAddr = ip()
  const nodeName = new Md5().appendStr(ipAddr).end() as string
  return nodeName
}
