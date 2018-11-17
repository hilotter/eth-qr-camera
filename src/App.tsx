import axios from 'axios'
import * as React from 'react'
import QrReader from 'react-qr-reader'
import erc721ABI from './erc721ABI'
import web3 from './web3'

const GAME_CONTRACT_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d' // Crypto Kitties
const GOOGLE_HOME_API_URL = 'https://d64a982d.ngrok.io/google-home-notifier'

interface IState {
  address: string,
  balance: number,
  delay: number,
  facingMode: "user" | "environment" | undefined
}

class App extends React.Component<any, IState> {
  constructor(props){
    super(props)
    this.state = {
      address: '',
      balance: 0,
      delay: 7000,
      facingMode: 'user'
    }

    this.handleScan = this.handleScan.bind(this)
  }
  public handleScan = (result) => {
    if(result){
      this.getAddress(result)
    }
  }

  public getAddress = async (result) => {
    this.setState({ address: '', balance: 0 })

    const matches = result.match(/(0x[a-zA-Z0-9]+)/)
    if (matches) {
      const address = matches[1]
      const contract = new web3.eth.Contract(erc721ABI, GAME_CONTRACT_ADDRESS);
      const tokenBalance = await contract.methods.balanceOf(address).call()
      const condition = web3.utils.toBN('1')

      const params = new URLSearchParams();
      if (web3.utils.toBN(tokenBalance).gte(condition)) {
        params.append('text', "正解！次のヒントは「ゾンビ」です。");
      } else {
        params.append('text', "残念。猫を持っていないようです。");
      }
      await axios.post(GOOGLE_HOME_API_URL, params)

      console.log('ok')
      this.setState({ address, balance: tokenBalance })
    }
  }

  public handleError(err){
    console.error(err)
  }

  public render(){
    const previewStyle = {
      height: 320,
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 320,
    }

    return(
      <div style={{ textAlign: 'center' }}>
        <p>Q1: 猫を示せ [<a href="https://www.cryptokitties.co/" target="_blank">Hint</a>]</p>
        <QrReader
          delay={this.state.delay}
          facingMode={this.state.facingMode}
          style={previewStyle}
          onError={this.handleError}
          onScan={this.handleScan}
        />
      </div>
    )
  }
}

export default App;
