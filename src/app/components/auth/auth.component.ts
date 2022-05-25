import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {AuthWeb3Service} from 'src/services/auth-web3.service';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  loginUser: boolean = false;
  //Dirección del usuario que firma
  addressUser: string = '';
  //Mostrar cartera o no
  addressUserView: boolean = false;

  web3: any;

  constructor(private cdr: ChangeDetectorRef, private authWeb3Srv: AuthWeb3Service) { 
    this.web3 = this.authWeb3Srv.web3Instance; //Nos devuelve instancia de web3 y lo guardamos en la variable
    console.log(this.web3);
  }

  connect(){
    this.authWeb3Srv.connect();
  }

  ngOnInit(): void {
    /**Nos subscribimos a dos observables
     * El primero, nos dara true o false dependiendo de si el usuario esta logueado o no
    */
    this.authWeb3Srv.loginUser.subscribe((resultado: boolean)=>{
      this.loginUser = resultado;
      //Si no esta logueado, no mostramos la cartera, si lo está, la mostramos
      (!this.loginUser) ? this.addressUserView = false : this.addressUserView = true;
      this.cdr.detectChanges();
    });
    //Nos devuelve un string con la direccón del usuario y lo trasladamos a nuestra variable
    this.authWeb3Srv.addresUser.subscribe((resultado : string)=>{
      this.addressUser = resultado;
      this.cdr.detectChanges();
    } )
  }

}
