import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldShowWelcome} from '../lib/feedback.ts';

test('welcome appears on a fresh visit but does not repeat in the same session',()=>{
  assert.equal(shouldShowWelcome('',null),true);
  assert.equal(shouldShowWelcome('?city=tokyo','1'),false);
});

test('shared trip links open directly without the welcome screen',()=>{
  assert.equal(shouldShowWelcome('?trip=shared-trip',null),false);
  assert.equal(shouldShowWelcome('?city=tokyo&trip=shared-trip',null),false);
  assert.equal(shouldShowWelcome('?city=tokyo',null),true);
});
