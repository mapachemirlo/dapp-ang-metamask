import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
//Para trabajar con instacias web3
import Web3 from 'web3';
//Para mensajes de error
import Swal from 'sweetalert2';

//declare: Esto existe en la ejecucion y sera de este tipo
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class AuthWeb3Service {
web3: any = null;
//utilizamos el get del objeto web3 para devolvernos la instacia
get web3Instance() { return this.web3;}
//Array de identificadores de cadena para identificar las redes autorizadas a interactuar con nuestra red en la que tendremos nuestro smart contract
chainIds: string[] = ['0x1'];
//BehaviorSubject: Observable al cual se le asigna un valor inicial y se le observan los cambios
//AddressUser contendra la cadena con la que el usuario firmará las transacciones
addresUser:any = new BehaviorSubject<string>('');
//Observable tipo Boolean para saber si el usuario esta logado o no 
loginUser: any  =new BehaviorSubject<boolean>(false);

  constructor() {
    //Si sale undefined, no tiene metamask instalado, si no creamos instancia de web3
    if(typeof window.ethereum !== 'undefined'){
      this.web3 = new Web3(window.ethereum);
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No tienes instalado Metamask!'
      });
    }
   }
   /**
    * Inicializa el proceso en el que el usuario nos autoriza a poder transaccionar
    * ya que con la instancia web3 solo tendremos permisos de lectura-
    */
   connect(){
     this.handleIdChainChanged();
   }

   async handleIdChainChanged() {
     //Solicitamos al api de metamask la cadena en la que esta el usuario
     const chainId: string = await window.ethereum.request({method:'eth_chainId'});
     //Comprobamos si esta en nuestro array de cadenas de redes aceptadas y si no esta, lo indicamos
     //Si esta, detectamos la dirección del usuario
     if(this.chainIds.includes(chainId)){
      this.handleAccountsChanged();
     }else{
       Swal.fire({
         icon:'error',
         title:'Oops...',
         text: 'Selecciona la red principal de Ethereum',
        });
     }
     //Dejamos escuchando dos eventos que detectan el cambio de cartera y de red
     window.ethereum.on('chainChanged', (resultado:string) =>{
      if(!this.chainIds.includes(resultado)){
       this.logout();
       Swal.fire({
         icon:'error',
         title:'Oops...',
         text: 'Selecciona la red principal de Ethereum',
        });
      } else{
        if(this.addresUser.getValue() === ''){
          this.handleAccountsChanged();
        }else{
          this.authBackend();
        }
      }
    });
   }

   async handleAccountsChanged(){
    //Llamamos al api de metamask con el metodo eth_requestAccounts
    const accounts : string [] = await window.ethereum.request({method: 'eth_requestAccounts'});
    //Direccion con el usuario va a firmar las transacciones
    //Al ser un Behaivor, le podemos actualizar cn el metodo next
    this.addresUser.next(accounts[0]);
    this.authBackend();
    //Quedamos escuchando en el evento de cambio de cuenta
    window.ethereum.on('accountsChanged', (resultado:string[]) =>{
      this.addresUser.next(accounts[0]);
      this.authBackend();
    });
  }

  async authBackend(){
    //Si el api de autentificacion da Ok, logamos al usuario
    this.loginUser.next(true);
    //Si falla, cerramos sesion
    //this.logout();
  }

  logout(){
    this.loginUser.next(false);
  }
}
