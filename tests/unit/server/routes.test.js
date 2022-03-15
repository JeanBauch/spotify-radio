import { jest, expect, describe, test, beforeAll, afterEach } from '@jest/globals'
import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js'
import { handler } from '../../../server/routes.js'
import TestUtil from '../_util/testUtil.js'

const {
  pages,
  location,
  constants: {
    CONTENT_TYPE
  }
} = config

let params;

describe('#Routes - test site for api response', () => {

  beforeAll(() => {
    params = TestUtil.defaultHandleParams();
  });

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  test('GET / - Should redirect to home page', async () => {
    params.request.method = 'GET'
    params.request.url = '/'
    
    await handler(...params.values())
    expect(params.response.writeHead).toBeCalledWith(
      302,
      {
        'Location': location.home
      }
    )
    expect(params.response.end).toHaveBeenCalled()
  })

  test(`GET /home - Should response with ${pages.homeHTML} file stream`, async () => {
    params.request.method = 'GET'
    params.request.url = '/home'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name,
    ).mockResolvedValue({
      stream: mockFileStream,
    })

    jest.spyOn(
      mockFileStream,
      "pipe"
    ).mockReturnValue()
    
    await handler(...params.values())
    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)

  })

  test(`GET /controller - Should response with ${pages.controllerHTML} file stream`, async () => {
    params.request.method = 'GET'
    params.request.url = '/controller'
    const mockFileStream = TestUtil.generateReadableStream(['anything'])

    jest.spyOn(
      Controller.prototype,
      "getFileStream"
    ).mockResolvedValue({
      stream: mockFileStream,
    })

    jest.spyOn(
      mockFileStream,
      "pipe"
    ).mockReturnValue()
    
    await handler(...params.values())
    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)

  })

  test(`GET /index.html - Should response with file stream`, async () => {
    const filename = '/index.html'
    params.request.method = 'GET'
    params.request.url = filename
    const expectedType= '.html'
    const mockFileStream = TestUtil.generateReadableStream(['anything'])

    jest.spyOn(
      Controller.prototype,
      "getFileStream"
    ).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType
    })

    jest.spyOn(
      mockFileStream,
      "pipe"
    ).mockReturnValue()
    
    await handler(...params.values())
    expect(Controller.prototype.getFileStream).toBeCalledWith(filename)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    expect(params.response.writeHead).toHaveBeenCalledWith(
      200, {
        'Content-Type': CONTENT_TYPE[expectedType]
      }
    )
  })

  test(`GET /file.ext - Should response with file stream`, async () => {
    const filename = '/file.ext'
    params.request.method = 'GET'
    params.request.url = filename
    const expectedType = '.ext'
    const mockFileStream = TestUtil.generateReadableStream(['anything'])

    jest.spyOn(
      Controller.prototype,
      "getFileStream"
    ).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType
    })

    jest.spyOn(
      mockFileStream,
      "pipe"
    ).mockReturnValue()
    
    await handler(...params.values())
    expect(Controller.prototype.getFileStream).toBeCalledWith(filename)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    expect(params.response.writeHead).not.toHaveBeenCalled()
  })

  test(`POST /unknown - Given an inexistent route it should response with 404`, async () => {
    params = TestUtil.defaultHandleParams();
    params.request.method = 'POST'
    params.request.url = '/unknown'

    await handler(...params.values())

    expect(params.response.writeHead).toHaveBeenCalledWith(404)
    expect(params.response.end).toHaveBeenCalled()
  })

  describe('exceptions', () => {
    test('given inexistent file it should respond with 404', async () => {
      params.request.method = 'GET'
      params.request.url = '/index.png'

      jest.spyOn(
        Controller.prototype,
        'getFileStream',
      ).mockRejectedValue(new Error('Error: ENOENT: no such file or directy'))

      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(404)
      expect(params.response.end).toHaveBeenCalled()
    })

    test('given an error it should respond with 500', async () => {
      params.request.method = 'GET'
      params.request.url = '/index.png'

      jest.spyOn(
        Controller.prototype,
        'getFileStream',
      ).mockRejectedValue(new Error('Error:'))

      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(500)
      expect(params.response.end).toHaveBeenCalled()
    })

  })
})