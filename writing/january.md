# January Puzzle

# Sun 12/1/24

## Provisional Solution

- naive approach:
- code a Sudoku solver
- iterate through the 9 possible number sets to obtain all possible solutions
- for each solution, calculate the highest common factor of the rows

## Starting with HCF Function

- HCF is the intersection of common prime factors
- faint memory of a clever trick using a while loop to continually divide the target integer until no longer possible
- makes sense, because if 2 is a prime factor, we can divide the number by 2 N times until it is no longer divisible by 2
- this also means that it cannot be divisible by 4, 8, 16 etc.
- next we try to divide by 3,
- then 4 (which we know won't work)
- then 5 (which might - 5 is prime)
- etc.
- may not be perfectly efficient, but probably works for numbers < 1 billion
