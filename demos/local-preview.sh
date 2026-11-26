#!/bin/sh
# Staged local input scene, not an AI client. No provider request is made.
# Run inside Herdr, then type "Prepare the workspace." without submitting.
printf '\033[2J\033[H'
printf '\033[38;5;215mMake it so / COMMAND\033[0m\n\n'
printf '\033[1;38;5;213mNEW INSTRUCTION\033[0m\n\n\n'
printf '\033[1m> '
IFS= read -r instruction
printf '\033[0m\nLocal preview only. No request was sent.\n'
