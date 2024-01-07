#!/bin/bash

# Number of times to run the command
times_to_run=$1

# Check if the number of times to run is provided and is a number
if ! [[ $times_to_run =~ ^[0-9]+$ ]]; then
    echo "Please provide a valid number."
    exit 1
fi

# Loop and run the command in the background
for (( i=1; i<=times_to_run; i++ ))
do
   ts-node connect.ts &
done

# Wait for all background processes to finish
wait
