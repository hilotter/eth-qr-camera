import * as React from 'react'
import QrReader from 'react-qr-reader'
import web3 from './web3'

const MIN_ETH = '0.0001'

interface IState {
  address: string,
  balance: number,
  delay: number,
  facingMode: "user" | "environment" | undefined,
  success: boolean,
}

class App extends React.Component<any, IState> {
  constructor(props){
    super(props)
    this.state = {
      address: '',
      balance: 0,
      delay: 3000,
      facingMode: 'user',
      success: false,
    }

    this.handleScan = this.handleScan.bind(this)
  }
  public handleScan = (result) => {
    if(result){
      this.getAddress(result)
    }
  }

  public getAddress = async (result) => {
    this.setState({ address: '', balance: 0, success: false })

    const matches = result.match(/(0x[a-zA-Z0-9]+)/)
    if (matches) {
      const address = matches[1]
      const ethBalance = await web3.eth.getBalance(address)
      const balance = web3.utils.fromWei(ethBalance, 'ether')
      const condition = web3.utils.toBN(web3.utils.toWei(MIN_ETH, 'ether'))
      if (web3.utils.toBN(ethBalance).gte(condition)) {
        this.setState({ success: true })
      }
      this.setState({ address, balance })
    }
  }

  public handleError(err){
    console.error(err)
  }

  public render(){
    const previewStyle = {
      height: 320,
      marginLeft: "auto",
      marginRight: "auto",
      width: 320,
    }

    return(
      <div>
        <QrReader
          delay={this.state.delay}
          facingMode={this.state.facingMode}
          style={previewStyle}
          onError={this.handleError}
          onScan={this.handleScan}
        />
        <p>Balance: {this.state.balance}ETH</p>
        <p>Hold {MIN_ETH}ETH?: {this.state.success.toString()}</p>
      </div>
    )
  }
}

export default App;
