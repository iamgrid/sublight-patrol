# Sublight Patrol Behaviors

## 1) Default

### 1.1) Friendly and neutral entities, hostiles < if player not in range >

- Hold station
- Travel at set velocity
- Match velocity with guarded entity

### 1.2) Hostile entities < if player in range >

a. Attempt to avoid shots
b. Attack the player:

- <if: player in sightline & range>: shoot
- <if: player not in sightline & range>: attempt to get into sightline and range

## 2) When damaged by the player

### 2.1) Friendly entities

- < if: received shots < 5 >: Increasingly irate dialog
- < if: received shots >= 5 >: Flee

### 2.2) Neutral entities

1. Turn hostile
2. - < if: has weapons >:

     - <if: protecting another entity>:
       a. Attempt to soak up shots
       b. Attack the player
     - <if: not protecting another entity>:
       - < if: hull > 50% >: Attack the player
       - < if: hull < 50% >: Flee

   - < if: doesn't have weapons >: Flee

### 2.3) Hostile entities

SEE 1.2
