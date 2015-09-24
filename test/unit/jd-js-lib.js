import jsLib from '../../src/jd-js-lib';

describe('jsLib', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(jsLib, 'greet');
      jsLib.greet();
    });

    it('should have been run once', () => {
      expect(jsLib.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(jsLib.greet).to.have.always.returned('hello');
    });
  });
});
