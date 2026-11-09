import { expect } from 'chai';
import sinon from 'sinon';

import apiClient from '../axios/axios';
import { getCountries, getDepartments } from './referenceDataApi';
import type { ReferenceOption } from './referenceDataApi';

describe('referenceDataApi', () => {
  let getStub: sinon.SinonStub;

  const countries: ReferenceOption[] = [
    { id: 1, name: 'India' },
    { id: 2, name: 'United States' },
  ];

  const departments: ReferenceOption[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Human Resources' },
  ];

  beforeEach(() => {
    getStub = sinon.stub(apiClient, 'get');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getCountries', () => {
    it('should fetch countries and return the response data', async () => {
      getStub.resolves({ data: countries });

      const result = await getCountries();

      expect(getStub.calledOnce).to.equal(true);
      expect(getStub.firstCall.args[0]).to.equal('/countries');
      expect(result).to.deep.equal(countries);
    });

    it('should pass the abort signal to the API request', async () => {
      const abortController = new AbortController();
      getStub.resolves({ data: countries });

      await getCountries(abortController.signal);

      expect(getStub.firstCall.args[1]).to.deep.equal({
        signal: abortController.signal,
      });
    });

    it('should propagate API errors', async () => {
      const error = new Error('Failed to fetch countries');
      getStub.rejects(error);

      try {
        await getCountries();
        expect.fail('Expected getCountries to throw an error');
      } catch (actualError) {
        expect(actualError).to.equal(error);
      }
    });
  });

  describe('getDepartments', () => {
    it('should fetch departments and return the response data', async () => {
      getStub.resolves({ data: departments });

      const result = await getDepartments();

      expect(getStub.calledOnce).to.equal(true);
      expect(getStub.firstCall.args[0]).to.equal('/departments');
      expect(result).to.deep.equal(departments);
    });

    it('should pass the abort signal to the API request', async () => {
      const abortController = new AbortController();
      getStub.resolves({ data: departments });

      await getDepartments(abortController.signal);

      expect(getStub.firstCall.args[1]).to.deep.equal({
        signal: abortController.signal,
      });
    });

    it('should propagate API errors', async () => {
      const error = new Error('Failed to fetch departments');
      getStub.rejects(error);

      try {
        await getDepartments();
        expect.fail('Expected getDepartments to throw an error');
      } catch (actualError) {
        expect(actualError).to.equal(error);
      }
    });
  });
});
