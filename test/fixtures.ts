import chai from 'chai';
import sinonChai from 'sinon-chai';

export const mochaGlobalSetup = () => {
    chai.use(sinonChai);
}