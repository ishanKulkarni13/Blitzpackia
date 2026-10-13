# Backpack Blitz — Player Guide

## Welcome

Backpack Blitz is a fast-paced loot-packing challenge created for IEEE Day at VIT Pune.

You have a limited-capacity backpack, a collection of valuable items, and only a short amount of time to decide what to carry. Your goal is to pack the most valuable combination of items possible before the timer reaches zero.

You are competing against a greedy bot. The bot selects items based on value per kilogram, but it does not always find the mathematically best combination. Careful planning can help you beat it.

---

## How to start a round

When the game opens, you will see the round setup screen.

### 1. Enter your name

Your name is optional.

- You can enter up to 14 characters.
- If you leave the field empty, the game creates a temporary player name such as `Player 1`.
- Your name is shown on the public player leaderboard if your score is saved.
- Do not enter sensitive personal information in the name field.

### 2. Enter your phone number (optional)

The phone number field is optional and is useful if you want to play again later as the same player.

If you enter a phone number:

- Your first submitted score is associated with that phone number.
- If you play again with the same phone number and achieve a higher score, your previous score is replaced by the higher score.
- If your new score is equal to or lower than your previous score, your previous higher score is kept.
- Your phone number is not shown on the public leaderboard.
- Your phone number is visible only to an authenticated administrator.

If you do not enter a phone number:

- Each completed round is treated as a separate anonymous score entry.
- Playing again will create another independent leaderboard entry.

Enter the same phone number consistently if you want the game to recognize your previous best score. Formatting such as spaces, hyphens, and a leading plus sign is normalized by the server when possible.

### 3. Select your branch

Select your branch from the dropdown menu.

A branch is required before you can start. Your branch determines which department/branch standing receives your score.

The branch list includes options such as:

- DESH
- Computer Engineering
- Computer Engineering (Software Engineering)
- Information Technology
- Computer Science & Engineering specializations
- Artificial Intelligence & Data Science
- Electronics & Telecommunication Engineering
- Instrumentation & Control Engineering
- Mechanical Engineering
- Civil Engineering

### 4. Choose a difficulty

Choose one of the three difficulty levels:

| Difficulty | Items | Backpack capacity | Default time |
|---|---:|---:|---:|
| Easy | 5 | 10 kg | 50 seconds |
| Normal | 6 | 15 kg | 45 seconds |
| Hard | 8 | 20 kg | 40 seconds |

The item values and weights are generated for each round, so every round can require a different strategy.

### 5. Choose the round time

You can use the automatic time for the selected difficulty or choose a custom limit:

- Auto
- 20 seconds
- 30 seconds
- 45 seconds
- 60 seconds
- 90 seconds

The selected difficulty and time preference may be remembered by your browser for your next visit.

### 6. Start the heist

Select **Start heist** to begin.

The timer starts immediately and the loot becomes active.

---

## Understanding the game screen

### Timer

The large timer at the top shows how many seconds remain.

- The timer counts down in tenths of a second.
- When fewer than 10 seconds remain, it changes to the warning color and pulses.
- When the timer reaches zero, the game automatically locks your backpack and submits the round.

### Your haul

**Your haul** shows the total value of the items currently in your backpack.

This is the value used as the main part of your score.

### Weight

**Weight** shows your current backpack weight and its maximum capacity.

For example:

```text
11/15
```

means your backpack currently weighs 11 kg and can hold up to 15 kg.

### Greedy bot

**Greedy bot** shows the value collected by the computer opponent.

The bot chooses items by value per kilogram. This is a quick strategy, not necessarily the best possible strategy.

### The vault

The vault contains the available loot for the round.

Each card displays:

- An item emoji
- The item name
- Its weight in kilograms
- Its value

### Your backpack

The backpack area shows the items you have selected.

The meter below the backpack title shows how close you are to the weight limit.

- Gold indicates available capacity.
- Teal indicates that the backpack is full.

---

## Selecting and removing items

You can move items using either clicking/tapping or drag and drop.

### Click or tap

Select an item by clicking or tapping its card in the vault.

The item is added to your backpack.

Click or tap the item again in the backpack to remove it.

### Drag and drop

On devices that support drag and drop:

1. Press and hold an item card.
2. Drag it into the backpack area.
3. Release it to add it.

To remove an item:

1. Drag it from the backpack back to the vault.
2. Release it in the vault area.

Clicking/tapping is recommended on mobile devices.

### Selected cards remain visible

When an item is added to your backpack, its original card remains in the vault with a blurred, faded appearance.

This is intentional:

- It shows which items were originally available.
- It prevents the other cards from shifting position.
- It lets you understand the complete item set at a glance.
- The normal copy of the selected item appears in your backpack.

---

## Backpack capacity rules

Your backpack cannot exceed its weight limit.

If adding an item would exceed the capacity:

- The item is not added.
- The game displays a capacity warning.
- You can remove another item and try again.

For example, if your backpack holds 14/15 kg, an item weighing 2 kg cannot be added. You must first remove at least 1 kg of existing loot.

The most valuable single item is not always the best choice. A group of smaller items may provide more total value while using the same space.

---

## Locking your backpack

When you are satisfied with your selection, select:

```text
Lock the bag (Enter)
```

This ends the round immediately, even if time remains.

You can also wait for the timer to expire. When the timer reaches zero, the game locks the bag automatically.

After the round ends, the result screen shows:

- Whether you achieved a perfect result
- Whether you beat the greedy bot
- Your score
- Your selected value
- The bot’s value
- The best possible value for that item set
- Your branch information
- The mathematically best item combination

Select **Next player** to return to the setup screen for another round.

---

## How scoring works

Your score is based on how well your backpack compares with the best possible solution.

The game calculates:

1. Your total selected value.
2. The best possible value for the generated items and capacity.
3. Whether your value is greater than the greedy bot’s value.
4. Whether your selection matches the best possible value.
5. How much time remains when you finish a perfect round.

The score has these components:

- A base score based on your value compared with the optimal value.
- A bonus for beating the greedy bot.
- A larger bonus for finding a perfect solution.
- An additional time bonus for finishing a perfect solution quickly.

You do not need to manually calculate the score. Focus on maximizing value while staying within the weight limit.

### Perfect heist

You achieve a perfect heist when your selected value matches the best possible value for that round’s items and backpack capacity.

A perfect result is different from simply beating the bot. You may beat the bot without finding the best possible combination.

### Beating the bot

You beat the bot when your selected value is greater than the greedy bot’s value.

The bot is a useful benchmark, but the best target is the mathematically optimal solution.

---

## Leaderboards

The leaderboard has two views.

### Departments

The Departments view ranks branches based on their combined performance.

For each branch:

- The scores are sorted from highest to lowest.
- The branch’s best three scores are selected.
- Those three scores are added together.
- Branches are ranked by that total.

This means one extremely high score is useful, but a strong group of up to three players gives a branch the best chance of ranking highly.

### Players

The Players view shows individual scores.

- Scores are shown from highest to lowest.
- Up to the top 15 entries are displayed.
- You can filter the list by branch.
- Player names, branch codes, and scores are public.
- Phone numbers are never shown.

If a phone-linked player improves their score, the old score is updated rather than creating a second entry for that phone number.

---

## Phone-number retry examples

### Example 1: First phone-linked round

You enter:

```text
Name: Asha
Phone: 98765 43210
Score: 820
```

The game creates a score entry associated with that normalized phone number.

### Example 2: Higher retry

You play again with the same phone number and score 910.

The existing 820 score becomes 910. A second public player entry is not created.

### Example 3: Lower retry

You play again and score 760.

The existing 910 score remains on the leaderboard.

### Example 4: No phone number

You leave the phone field blank and score 820. You play again without a phone number and score 760.

Both rounds are treated as separate anonymous entries because the game has no way to identify them as the same player.

---

## Strategy tips

### 1. Check value per kilogram

Value per kilogram is a useful first comparison:

```text
item value ÷ item weight
```

An item worth 40 points and weighing 4 kg has a value density of 10 points per kilogram.

An item worth 35 points and weighing 2 kg has a value density of 17.5 points per kilogram and may be a better starting choice.

### 2. Do not blindly copy the greedy bot

The greedy bot uses value density, but combinations matter.

For example:

- A 6 kg item may have a very high value density.
- Two smaller items may fit together better.
- Choosing the large item may leave unusable space.

Look for combinations that use the backpack capacity efficiently.

### 3. Leave room for combinations

Do not fill the backpack too early with the first valuable item you see.

Keep enough capacity available to consider the remaining cards. A slightly less valuable item may combine with another item to produce a better total.

### 4. Compare total value, not item count

The goal is not to carry the most items. The goal is to maximize total value.

A backpack with two high-value items can beat a backpack with four low-value items.

### 5. Use the blurred vault cards

Because selected cards remain visible in a blurred state, you can compare your current backpack with every original option without losing the card positions.

Use the vault as a reference while rearranging your selection.

### 6. Finish perfect rounds quickly

If two rounds have the same perfect value, the faster perfect round receives a stronger time bonus.

Once you are confident that your selection is optimal, lock the bag instead of waiting unnecessarily.

### 7. Use Easy to learn

Easy mode has fewer items and more time. It is useful for learning:

- How item weight works
- How the capacity meter behaves
- How the greedy bot compares with your selection
- How the score result is displayed

### 8. Use Hard for competition

Hard mode has more items, a larger capacity, and less default time. It provides more combinations and requires faster decisions.

---

## Keyboard and accessibility controls

The game supports normal keyboard focus navigation.

Useful controls include:

- `Enter` on the setup screen: start the heist.
- `Enter` while playing: lock the backpack.
- `Enter` on the result screen: continue to the next player.
- `Space` on the setup screen: start the heist when focus is not inside a form control.
- `Space` on the result screen: continue to the next player when focus is not inside a form control.
- `Tab`: move between controls.
- `Enter` or `Space` on a focused loot card: activate it like a click.

The game includes visible focus outlines for keyboard users and respects reduced-motion preferences when enabled in the browser or operating system.

---

## Common situations

### I cannot start the game

Make sure you selected a branch. A branch is required.

### An item did not move into my backpack

Check the weight counter. The item may exceed the remaining capacity.

You can remove another item first and then try again.

### The timer reached zero before I finished

The game automatically locks the backpack when time expires. Your current selection is submitted and scored.

### My phone number is not on the leaderboard

Phone numbers are intentionally hidden from the public leaderboard. Only the associated name, branch, and score are shown publicly.

### My lower retry did not replace my old score

That is expected. A phone-linked score is replaced only when the new score is higher.

### My score could not be saved

The game may be temporarily unable to reach the database. If an error message appears, check your connection and try another round later. A result shown on screen does not guarantee that the database save succeeded if an explicit save error is displayed.

### The leaderboard is empty

The leaderboard may not have any completed rounds yet, or the database may temporarily be unavailable. Try refreshing the page after the game has been configured.

---

## Privacy reminder

The phone-number feature is provided only to recognize returning players and retain their best score.

- Phone numbers are optional.
- Phone numbers are not displayed on public leaderboards.
- Phone numbers are not included in public leaderboard API responses.
- Phone numbers are available only through the protected admin area.
- Do not use someone else’s phone number.
- If you do not want your attempts linked together, leave the phone field blank.

---

## Quick-start summary

1. Enter your name if you want one displayed.
2. Optionally enter your phone number to retain your best score across retries.
3. Select your branch.
4. Choose a difficulty and time limit.
5. Select valuable loot by clicking, tapping, or dragging.
6. Keep the backpack within its weight capacity.
7. Compare your haul with the greedy bot.
8. Lock the bag before time runs out.
9. Try to match the optimal value and finish quickly.
10. Check the public player and department leaderboards.