import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Skiox } from './skiox';

describe('Skiox', () => {
  let component: Skiox;
  let fixture: ComponentFixture<Skiox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skiox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Skiox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
