{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs
    yarn
    ruby
    gnumake

    # keep this line if you use bash
    bashInteractive
  ];
}
