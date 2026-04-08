#!/bin/bash

readonly ENCRYPT="encrypt"
readonly DECRYPT="decrypt"
readonly ACTIONS=("$ENCRYPT" "$DECRYPT")

encrypt_envs() {
    # Stops the script immediately if any command fails — avoids partial/inconsistent encryption
    set -e

    # Prompt for passphrase (silent input)
    read -sr -p "Enter passphrase: " GPG_PASSPHRASE
    echo

    # Find all .env*.local files in current dir and subdirs
    find . -type f -name ".env*.local" | while read -r file; do
        output="${file}.gpg"
        echo "Encrypting: $file → $output"
        gpg -c --batch --yes --pinentry-mode loopback --passphrase "$GPG_PASSPHRASE" --output "$output" "$file"
    done

    echo "All .env*.local files encrypted."
}

decrypt_envs() {
    # Stop on any error
    set -e

    # Prompt for passphrase (silent input)
    read -sr -p "Enter passphrase: " GPG_PASSPHRASE
    echo

    # Find all .env*.local.gpg files and decrypt them
    find . -type f -name ".env*.local.gpg" | while read -r file; do
        output="${file%.gpg}" # strip .gpg extension
        echo "Decrypting: $file → $output"
        gpg -d --batch --yes --pinentry-mode loopback --passphrase "$GPG_PASSPHRASE" --output "$output" "$file"
    done

    echo "All .env*.local.gpg files decrypted."
}

echo "Choose action:"
select action in "${ACTIONS[@]}"; do
    echo
    case $action in
    "$ENCRYPT")
        encrypt_envs
        ;;
    "$DECRYPT")
        decrypt_envs
        ;;
    esac
    break
done
