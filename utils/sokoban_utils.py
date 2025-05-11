# import os
from sokoban_solvers import State, EnhancedAStarAgent, arrow_dictionary
import matplotlib.pyplot as plt
import numpy as np


# convert optimal_solution to string
def search_key(dictionary, val):
    for k, v in dictionary.items():
        if v == val:
            return k


def convert_steps_to_arrows(steps):
    dulr_steps = ""
    for step in steps:
        converted_step = search_key(arrow_dictionary, step)
        dulr_steps += converted_step
    return dulr_steps


def init_board(level_string):
    """
    Determines whether the given level is playable by checking a variety of conditions:
      1. (not implemented here) the level is rectangular (i.e. every line is the same length)
      2. the level contains only the following characters: "\n", "#", " ", "-", "@", "$", "."
      3. the level contains exactly one player
      4. the level contains the same number of boxes and goals (and at least one of each)
      5. (not implemented here) the level can be solved by an ASTAR agent
    If the level is playable, return the solution (return False otherwise).
    """

    # Check if the level contains only the allowed characters
    allowed_chars = set("\n# @$.*+")
    if not set(level_string).issubset(allowed_chars):
        raise ValueError("Level contains invalid characters")

    # Check if the level contains exactly one player
    if level_string.count("@") + level_string.count("+") != 1:
        raise ValueError("Level does NOT contain exactly one player")

    # Check if the level contains the same number of boxes and goals
    if level_string.count("$") != level_string.count("."):
        raise ValueError("Level contains different numbers of boxes and goals")

    # Now build the board
    lines = level_string.split("\n")
    board = State().stringInitialize(lines)
    return board


def draw_board(
    state, draw_player=True, draw_boxes=True, figtitle=None, subtitle=None, ax=None
):
    """
    Draws current state of a sokoban board using Matplotlib.

    Args:
        rows (int): Number of rows in the grid.
        cols (int): Number of columns in the grid.
        obstacles (list, optional): List of obstacle coordinates [(row, col), ...]. Defaults to None.
        start (tuple, optional): Start state coordinate (row, col). Defaults to None.
        goals (list, optional): List of goal state coordinates [(row, col), ...]. Defaults to None.
    """
    # Get the dimensions of the board
    rows, cols = state.height, state.width
    if ax is None:
        fig, ax = plt.subplots()

    # Draw grid lines
    ax.set_xticks(np.arange(0, cols, 1))
    ax.set_yticks(np.arange(0, rows, 1))
    ax.grid(True)  # Major grid lines
    ax.grid(which="minor", color="black", linestyle="-", linewidth=2)
    ax.set_xlim([0, cols])
    ax.set_ylim([0, rows])
    ax.set_aspect("equal")
    ax.invert_yaxis()  # Invert y-axis to match the grid orientation
    ax.tick_params(which="minor", size=0)  # Hide minor ticks
    ax.tick_params(which="major", size=0)  # Hide major ticks
    ax.tick_params(axis="x", top=True, labeltop=True, bottom=False, labelbottom=False)

    # Draw walls.
    # state.solid is a list of lists. True = wall; False = floor.
    for row_id, row in enumerate(state.solid):
        for col_id, tile in enumerate(row):
            if tile:
                ax.add_patch(plt.Rectangle((col_id, row_id), 1, 1, facecolor="black"))

    # Draw agent
    if draw_player:
        ax.add_patch(
            plt.Circle(
                (state.player["x"] + 0.5, state.player["y"] + 0.5),
                radius=0.3,
                facecolor="blue",
            )
        )

    # Draw shelves
    for target in state.targets:
        ax.add_patch(
            plt.Rectangle((target["x"], target["y"]), 1, 1, facecolor="limegreen")
        )

    # Draw boxes
    if draw_boxes:
        for box in state.crates:
            ax.add_patch(
                plt.Rectangle(
                    (box["x"] + 0.25, box["y"] + 0.25),
                    0.5,
                    0.5,
                    facecolor="saddlebrown",
                )
            )

    if subtitle:
        ax.set_title(subtitle, fontsize=10)
    if figtitle:
        plt.suptitle(figtitle, fontsize=10)

    return ax


def astar_solve(board, arrows=False):
    solver = EnhancedAStarAgent()
    solution, node, iters = solver.getSolution(board, maxIterations=1e7)
    # print("solution:", solution)
    if solution == None:
        return np.nan, iters

    if not node.checkWin():
        raise ValueError(f"Level is not solvable in {iters} steps")

    if arrows:
        solution = convert_steps_to_arrows(solution)

    return solution, iters


def load_level(collection_name, level_name):
    """
    Load a level from a file.
    """
    level_path = "levels/level1.txt"  # Adjust the path to your level file
    with open(level_path, "r") as file:
        level_string = file.read()
    return level_string


if __name__ == "__main__":
    # Example level string
    test_level = "  ###\n  #.#\n ##$##\n##@$.#\n#.$$##\n##$.#\n #.##\n ###"

    # Initialize the board
    board = init_board(test_level)
    solution, iters = astar_solve(board, arrows=True)

    # Visualize the board and solution
    title_string = f"ASTAR Iterations: {iters} | Solution: {solution}"
    subtitle_string = f"Manhattan dist to win: {board.getHeuristic()}"

    nshots = len(solution)

    fig, axs = plt.subplots(ncols=nshots)
    # loop through tickers and axes
    for move, ax in zip(solution, axs.ravel()):
        print(f"Move: {move}")
        # filter df for ticker and plot on specified axes
        board.update_board_from_arrow(move)
        draw_board(board, title_string, subtitle_string, ax=ax)
    plt.show()

    print("Starting state: ")
    print(board.getKey())
