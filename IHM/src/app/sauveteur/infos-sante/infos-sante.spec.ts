import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfosSante } from './infos-sante';

describe('InfosSante', () => {
  let component: InfosSante;
  let fixture: ComponentFixture<InfosSante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfosSante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfosSante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
