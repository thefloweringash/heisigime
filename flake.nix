{
  description = "A Remembering the Kanji input tool";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { self, nixpkgs }: {
    devShells = nixpkgs.lib.genAttrs ["aarch64-darwin"] (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in
      {
        default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            nodePackages.node-gyp
            yarn
            ruby
            gnumake

            # keep this line if you use bash
            bashInteractive
          ];
        };
      }
    );
  };
}
