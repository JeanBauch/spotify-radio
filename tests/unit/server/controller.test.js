import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { Controller } from '../../../server/controller'
import { Service } from '../../../server/service'
import TestUtil from '../_util/testUtil'

describe('Controller: Test suite for API control', () => {
  
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks
  })

  test('getFileStream - Should return a file stream', async () => {
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    const expectedType = '.html'

    jest
      .spyOn(Service.prototype, Service.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType
      })

    const controller = new Controller()
    const controllerReturn = await controller.getFileStream('/index.html')

    expect(Service.prototype.getFileStream).toBeCalledWith('/index.html')
    expect(controllerReturn).toStrictEqual({
      stream: mockFileStream,
      type: expectedType
    })
  })
})