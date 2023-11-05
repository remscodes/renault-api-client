<div align="center">
    <h1>Renault API Client</h1>
    <p>Http client to use Renault API </p>
</div> 

<div align="center">

[![github ci](https://img.shields.io/github/actions/workflow/status/remscodes/renault-api-client/npm-ci.yml.svg?logo=github&label=CI&style=for-the-badge)](https://github.com/remscodes/renault-api-client/actions/workflows/npm-ci.yml)
[![npm version](https://img.shields.io/npm/v/@remscodes/renault-api-client.svg?style=for-the-badge&logo=npm)](https://www.npmjs.org/package/@remscodes/renault-api-client)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@remscodes/renault-api-client.svg?style=for-the-badge)](https://bundlephobia.com/package/@remscodes/renault-api-client)
[![license](https://img.shields.io/github/license/remscodes/renault-api-client.svg?style=for-the-badge)](LICENSE)

</div>

## Installation

```shell
npm install @remscodes/renault-api-client
```

## Usage

```ts
import { RenaultClient } from '@remscodes/renault-api-client';

// Instantiate new Renault http client
const renault = new RenaultClient();

// Use Gigya and Kamereon sub http client.
const { gigya, kamereon } = renault;

// Login to Gigya service and get auth info (to be automatically stored into session).  
await gigya.login('myLogin', 'myPassword');
await gigya.getAccountInfo();
await gigya.getJwt();

// Get the proper `accountId` and store it into session.
const { accounts } = await kamereon.getPerson();
const myRenaultAccountId = accounts.find(acc => acc.accountType === 'MYRENAULT');

renault.session.accountId = myRenaultAccountId;

// Get the vehicle `vin`.
const { vin } = (await kamereon.getAccountVehicles()).vehicleLinks[0];

// Get vehicle info. 
const batteryStatus = await kamereon.readBatteryStatus(vin);
```

## Session

Auth info are stored in `RenaultSession` instance.

```ts
const renault = new RenaultClient();
const session = renault.session;
```

```ts
class RenaultSession {
  locale: string;
  country: string;
  gigyaToken: Optional<string>;
  token: Optional<string>;
  personId: Optional<string>;
  accountId: Optional<string>;
}
```

## Disclaimer

This project is not affiliated with, endorsed by, or connected to Renault. I accept no responsibility for any consequences, intentional or accidental, resulting from interaction with the Renault's API using this project.

## Credit

Resources API based on [@remscodes/renault-api](https://github.com/remscodes/renault-api#credit).

## License

[MIT](LICENSE) © Rémy Abitbol.

