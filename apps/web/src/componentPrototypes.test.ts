import { describe, it, expect } from 'vitest';

import {
  PagePrototype,
  ModalPrototype,
  DescriptionPrototype,
  TablePrototype,
  FormPrototype,
  TextPrototype,
  ButtonPrototype,
} from './componentPrototypes';

import { componentPrototypeMap, getComponentPrototype } from './componentMetas';
import { registerComponent } from './componentRegistry';

describe('component prototype groups', () => {
  it('exports individual prototype variables', () => {
    // individual prototype variables
    expect(PagePrototype).toBeDefined();
    expect(ModalPrototype).toBeDefined();
    expect(DescriptionPrototype).toBeDefined();
    expect(TablePrototype).toBeDefined();
    expect(FormPrototype).toBeDefined();
    expect(TextPrototype).toBeDefined();
    expect(ButtonPrototype).toBeDefined();
  });

  it('componentPrototypeMap maps to individual prototype variables', () => {
    expect(componentPrototypeMap.Button).toBe(ButtonPrototype);
    expect(componentPrototypeMap.Form).toBe(FormPrototype);
    expect(componentPrototypeMap.Page).toBe(PagePrototype);
    expect(componentPrototypeMap.Table).toBe(TablePrototype);
  });

  it('component getter returns registered component', () => {
    const Mock = () => null;
    registerComponent('Button', Mock);
    const proto = getComponentPrototype('Button');
    expect(proto?.component).toBe(Mock);
  });
});
