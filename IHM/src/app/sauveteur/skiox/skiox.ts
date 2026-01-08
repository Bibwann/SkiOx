// skiox.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-skiox',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './skiox.html',
  styleUrls: ['./skiox.scss']
})
export class Skiox {}
