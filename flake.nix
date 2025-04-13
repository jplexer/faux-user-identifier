{
  description = "Flake for faux Rebble user-identifier server";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bun2nix.url = "github:negatethis/bun2nix";
  };

  outputs = { self, nixpkgs, flake-utils, bun2nix }:
    (flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        b2n = bun2nix.defaultPackage.${system};
      in
      {
        packages = rec {
          faux-user-identifier = b2n.mkBunDerivation {
            name = "faux-user-identifier";
            version = "main";

            src = ./.;

            bunNix = ./bun.nix;

            index = ./index.ts;
          };

          default = faux-user-identifier;
        };

        devShells = rec {
          faux-user-identifier = with pkgs; mkShell {
            packages = [ bun b2n.bin ];
          };

          default = faux-user-identifier;
        };

        apps = rec {
          faux-user-identifier = flake-utils.lib.mkApp { drv = self.packages.${system}.leng; };
          default = faux-user-identifier;
        };

        nixosModules.default = { pkgs, lib, config, ... }:
          with lib;
          let
            cfg = config.services.faux-user-identifier;
          in
          {
            options.services.faux-user-identifier = {
              enable = mkOption {
                type = types.bool;
                default = false;
              };

              package = mkOption {
                type = types.package;
                default = self.packages.${pkgs.system}.faux-user-identifier;
              };

              environmentFile = mkOption {
                type = types.path;
                default = null;
              };
            };

            config = mkIf cfg.enable {

              systemd.services.faux-user-identifier = {
                description = "faux-user-identifier";
                wantedBy = [ "multi-user.target" ];
                wants = [ "network-online.target" ];
                after = [ "network-online.target" ];

                serviceConfig = {
                  DynamicUser = true;
                  ExecStart = "${cfg.package}/bin/faux-user-identifier";
                  EnvironmentFile = "${cfg.environmentFile}";
                  Restart = "on-failure";
                };

                unitConfig = {
                  StartLimitIntervalSec = 10;
                  StartLimitBurst = 3;
                };
              };
            };
          };
    }));
}

