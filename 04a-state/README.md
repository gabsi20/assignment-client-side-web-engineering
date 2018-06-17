# 04a-state

> Example solution for assignment 04a-state

## Start

```bash
npm i && npm start
```

# Description

Create an interlock with the following requirements:

## General

* You can manage at least two tracks (A, B)
* Track A has a maximum capacity of 5
* Track B has a maximum capacity of 4
* You have a pool of locomotives (size = 4)
* You have a pool of wagons (max = 10, initial size = 5)
* You are able to select the track you want to manage
* You are able to assign a wagon to the current track
* You are able to schedule a track
* You are able to refill the wagon pool
* Every track automatically gets a locomotive assgined along with the first wagon

## UX

* You should give a hint which track is the current one
* You should give information about the current track state (full, ready to be scheduled, …)
* Enable and disable buttons (no wagons left)
* Print warnings/errors when user tries todo something forbidden
