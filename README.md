<div align="center">
    <h1>Renault API Client</h1>
    <p>Http client using Renault API</p>
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

### Example

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
const accountId = accounts.find(acc => acc.accountType === 'MYRENAULT');

renault.session.accountId = accountId;

// Get the vehicle `vin` and store it into session.
const vehicles = await kamereon.getAccountVehicles();
const { vin } = vehicles.vehicleLinks[0];

renault.session.vin = vin;

// Get vehicle info. 
const batteryStatus = await kamereon.readBatteryStatus();
```

### Session

Authentication info are stored in `RenaultSession` instance.

```ts
const renault = new RenaultClient();
const session = renault.session;
```

```ts
class RenaultSession {
  // Locale that will be used to format date.
  // default: "fr_FR"
  locale: string;

  // Country code that will use as http param for Kamereon.
  // default: "FR"
  country: string;

  // Token to use Gigya getJWT API.
  // Automatically set when Gigya login API is called and succeed.
  gigyaToken: string | undefined;

  // Token to use Kamereon API.
  // Automatically set when Gigya getJWT API is called and succeed.
  token: string | undefined;

  // Selected person id.
  // Automatically set when Gigya getAccountInfo API is called and succeed.
  personId: string | undefined;

  // Selected account id.
  // To be set in order to be automatically passed into each Kamereon API functions that needs it.
  // Otherwise, it needs to be manually passed as function argument using `KamereonClient`.
  accountId: string | undefined;

  // Selected vehicle vin.
  // To be set in order to be automatically passed into each Kamereon API functions that needs it.
  // Otherwise, it needs to be manually passed as function argument using `KamereonClient`.
  vin: string | undefined;
}
```

### Error intercepting 

You can intercept response error by passing `onError` callback into client constructor.

Example :

```ts
const renault = new RenaultClient({
  onError: ({ status, url, error }, session) => {
    if (status === 401) {
      session.token = undefined;
      myService.clearToken();
      myService.navigateToLogin();
    }
    else {
      console.error(`Error ${status} from ${url} : ${error}`);
    }
  },
});
```

## Disclaimer

This project is not affiliated with, endorsed by, or connected to Renault. I accept no responsibility for any consequences, intentional or accidental, resulting from interaction with the Renault's API using this project.

## Credit

Resources API based on [@remscodes/renault-api](https://github.com/remscodes/renault-api#credit).

## License

[MIT](LICENSE) © Rémy Abitbol.

