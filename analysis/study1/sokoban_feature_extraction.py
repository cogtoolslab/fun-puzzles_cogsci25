import numpy as np
from utils.sokoban_solvers import EnhancedAStarAgent, State

def count_boxes(layout_string):
    return layout_string.count("$") + layout_string.count("*")

def count_walls(layout_string):
    return layout_string.count("#")

# count number of nonwall and nonbox tiles inside map where player can move over
def count_tiles_inside_walls(sokoban_map):
    # Convert the Sokoban map into a 2D list
    grid_init = [list(row) for row in sokoban_map.split('\n')]

    def make_rectangle(g):
        # Determine the maximum row length
        max_length = max(len(row) for row in g)
        
        # Pad each row with spaces to make it the same length as the longest row
        for row in g:
            while len(row) < max_length:
                row.append(' ')
        
        return g

    grid = make_rectangle(grid_init)
    rows, cols = len(grid), len(grid[0])
    # cols is a bit more complicated 

    # Directions for flood-fill (up, down, left, right)
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    # Flood-fill function starting from a specific tile
    def flood_fill(r, c):
        stack = [(r, c)]
        count = 0
        while stack:
            x, y = stack.pop()
            if 0 <= x < rows and 0 <= y < cols and grid[x][y] in (' ', '*', '$', '.', '@', '+'):
                count += 1
                grid[x][y] = '|'  # Mark as visited
                for dx, dy in directions:
                    stack.append((x + dx, y + dy))
        return count

    # Locate the starting position of '@'
    start_x, start_y = None, None
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] in ['@', '+']:
                start_x, start_y = r, c
                break
        if start_x is not None:
            break

    
    # If no '@' found, return 0 (invalid map or no starting position)
    if start_x is None:
        return 0

    # Flood-fill from the '@' position and count all reachable tiles
    return flood_fill(start_x, start_y)


def astar_solve(level, name=False, verbose=False):
        '''
        Determines whether the given level is playable by checking a variety of conditions:
          1. the level is rectangular (i.e. every line is the same length)
          2. the level contains only the following characters: "\n", "#", " ", "-", "@", "$", "."
          3. the level contains exactly one player
          4. the level contains the same number of boxes and goals (and at least one of each)
          5. the level can be solved by an ASTAR agent
        If the level is playable, return the solution (return False otherwise).
        '''
        if name != False:
            print(name)

        solver = EnhancedAStarAgent()
        # Check if the level is rectangular
        line_lengths = [len(line) for line in level.split("\n")]
        if len(set(line_lengths)) != 1:
            if verbose: print("--Level is NOT rectangular--")

        # Check if the level contains only the allowed characters
        allowed_chars = set("\n# -@$.*+")
        if not set(level).issubset(allowed_chars):
            if verbose: print("--Level contains INVALID characters--")
            return [], None 

        # Check if the level contains exactly one player
        if level.count("@") != 1:
            if verbose: print("--Level does NOT contain exactly one player--")
            return [], None 

        # Check if the level contains the same number of boxes and goals
        if level.count("$") != level.count(".") or level.count("$") == 0:
            if verbose: print("--Level contains DIFFERENT numbers of boxes and goals--")
            return [], None 

        # Check if the level can be solved by an ASTAR agent
        level_state = State().stringInitialize(level.split("\n"))
        solution, node, iters = solver.getSolution(level_state, maxIterations=1e7)

        if solution == None: 
            return np.nan, iters
        
        if not node.checkWin():
            if verbose: print(f"--Level cannot be solved (... in {iters} steps)--")
            return np.nan, iters
        elif verbose:
            print(f"++Level can be solved in {len(solution)} moves++")
            return len(solution), iters

        return solution, iters