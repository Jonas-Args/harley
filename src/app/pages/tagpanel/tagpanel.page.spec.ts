import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { tagpanelPage } from './tagpanel.page';

describe('tagpanelPage', () => {
  let component: tagpanelPage;
  let fixture: ComponentFixture<tagpanelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ tagpanelPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(tagpanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
