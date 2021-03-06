import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import config from '../../../server/config.js'
import { Service } from '../../../server/service.js'
import TestUtil from '../_util/testUtil'

const {
  dir: {
    publicDirectory
  }
} = config

describe("Services: test suite for API service", () => {
  
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('createFileStream - Should create a file stream and return it', async () => {
    const file = '/index.html'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest
      .spyOn(fs, fs.createReadStream.name)
      .mockResolvedValue(mockFileStream)

    const service = new Service()
    const serviceReturn = service.createFileStream(file)

    expect(fs.createReadStream).toBeCalledWith(file)
    expect(serviceReturn).resolves.toStrictEqual(mockFileStream)
  })

  test('getFileInfo - Should return file info', async () => {
    const file = '/index.html'
    const expectedType = '.html'
    const expectedFullFilePath = publicDirectory + file;

    jest
      .spyOn(path, path.join.name)
      .mockResolvedValue(expectedFullFilePath)

    jest
      .spyOn(fs.promises, fsPromises.access.name)
      .mockResolvedValue(null)

    jest
      .spyOn(path, path.extname.name)
      .mockResolvedValue('.html')

    const service = new Service()
    const serviceReturn = await service.getFileInfo(file)

    expect(serviceReturn).toStrictEqual({
      type: expectedType,
      name: expectedFullFilePath
    })
  })

  test('getFileStream - Should create a file stream and return it with the file type', async () => {
    const file = '/index.html'
    const expectedType = '.html'
    const expectedFullFilePath = publicDirectory + file;
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest
      .spyOn(fs, fs.createReadStream.name)
      .mockResolvedValue(mockFileStream)

    jest
      .spyOn(path, path.join.name)
      .mockResolvedValue(expectedFullFilePath)

    jest
      .spyOn(fsPromises, fsPromises.access.name)
      .mockResolvedValue(null)

    const service = new Service()
    const serviceReturn = await service.getFileStream(file)

    expect(serviceReturn.stream).resolves.toStrictEqual(mockFileStream)
    expect(serviceReturn.type).toStrictEqual(expectedType)
  })

})