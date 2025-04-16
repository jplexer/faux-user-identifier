# faux-user-identifier
Lightweight drop-in replacement for [user-identifier](https://github.com/pebble-dev/user-identifier) which allows for easy self-hosting of services like [bobby](https://github.com/pebble-dev/bobby-assistant) which require a user-identifier instance.

## Installation

### Docker

Clone the git repo and `cd` into it:

```
git clone https://github.com/jplexer/faux-user-identifier
cd faux-user-identifier
```

Edit the `compose.yml` file and add your own user token. You can find your Rebble user token by checking the `href` value of the "Switch to Rebble" button at the [Rebble boot page](https://boot.rebble.io/).

Then, use `docker compose` to bring up the server:

```
docker compose up -f compose.yml -d
```

### Nix

If you are using Nix and have the Flakes experimental feature activated, you can run the server with the following command:

```nix
nix run github:jplexer/faux-user-identifier
```

There is also a NixOS module exposed through the `flake.nix`. Here is an example on how to add it to your system's `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    faux-user-identifier.url = "github:jplexer/faux-user-identifier";
  };

  outputs = { self, nixpkgs, faux-user-identifier, }: {
    nixosConfigurations.nixos = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        faux-user-identifier.nixosModules.default {
          # This will enable the server to listen on http://localhost:4090
          services.faux-user-identifier = {
            enable = true;
            environmentFile = "/path/to/environment/file"
          };
        }
      ];
    };
  };
}
```

The environment file provided should contain either the `USER_TOKENS` environment variable, which is a JSON string with tokens as keys.

```
USER_TOKENS=''
  {
    "EXAMPLE_TOKEN": {"user_id": 1337, "has_subscription": true}
    "EXAMPLE_TOKEN2": {"user_id": 1234, "has_subscription": true}
  }
''
```

Or it should contain the following environment variables to describe an individual token (perfect for single-user installations):

```
VALID_TOKEN="EXAMPLE_TOKEN"
USER_ID="1337"
HAS_SUBSCRIPTION="true"
```

You can find your Rebble user token by checking the `href` value of the "Switch to Rebble" button at the [Rebble boot page](https://boot.rebble.io/).
