var config = require(__dirname + '/../config')
var solc = require('solc')
var abi = require('ethereumjs-abi')
var fs = require('fs')
var argv = require('yargs').argv

var now = +new Date()
var compilerVersion = config.get('compilerVersion')

if (!argv.owners || !argv.required) {
  throw new Error('Must have "owners" and "required" as command line arguments')
}
var owners = argv.owners.split(',')
var required = parseInt(argv.required)

var contract = fs.readFileSync(__dirname + '/../../../contracts/MultiSigWallet.sol', 'utf8')

solc.loadRemoteVersion(compilerVersion, function(err, solcSnapshot) {
  if (err) return console.error('err =', err)

  var contractCompiled = solcSnapshot.compile(contract, 1)
  var contractObj = contractCompiled.contracts[':MultiSigWallet']
  var bytecode = contractObj.bytecode
  var arguments = abi.rawEncode(['address[]', 'uint'], [owners, required]).toString('hex')

  var result = '0x' + bytecode + arguments

  var prefix = required + '_out_of_' + owners.length + '_'
  var filePath = __dirname + '/../output/' + prefix + 'MultiSigWalletBytecode_' + compilerVersion + '_' + now + '.txt'
  fs.writeFile(filePath, result, {flag: 'w'}, function(err) {
    if(err) return console.error('err =', err)
    console.log('bytecode created at path =', filePath)
  })
})