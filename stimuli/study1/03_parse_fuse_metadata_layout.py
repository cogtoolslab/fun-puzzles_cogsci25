import os
import json

# includes functions from parse_levels.py

def get_all_json_files(base_dir):
    """
    Recursively get all JSON file paths from the specified base directory.
    """
    json_files = []

    # Walk through the directory and its subdirectories
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.json'):  # Check if the file is a JSON file
                json_files.append(os.path.join(root, file))
    
    return sorted(json_files)

def load_json(file_path):
    """
    Load a JSON file and return its content as a Python dictionary.
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def fuse_jsons(json1, json2, fields_from_json1, fields_from_json2):
    """
    Combine two JSON objects based on specified fields.
    """
    fused = {}
    # print(fields_from_json1[0])
    # print(json1)

    # Select fields from the first JSON
    for field_1 in fields_from_json1:
        if field_1 in json1:
            fused[field_1] = json1[field_1]

    # Select fields from the second JSON
    for field_2 in fields_from_json2:
        if field_2 in json2:
            fused[field_2] = json2[field_2]

    return fused

def save_json(json_content, output_path):
    def safe_open_w(path):
        ''' Open "path" for writing, creating any parent directories as needed.
        '''
        os.makedirs(os.path.dirname(path), exist_ok=True)
        return open(path, 'w')

    with safe_open_w(os.path.join(output_path)) as f:
            json.dump(json_content, f, indent=2)
    print(f"saving to {output_path}")

def get_boxes(layout):
    all_boxes = []
    for y, row in enumerate(layout):
        for x, obj in enumerate(row):
            if obj == "$" or obj == '*':  # $ if on floor, * if on goal
                all_boxes.append({'x': x, 'y': y, 'state': obj})
    return (all_boxes)

def get_start_position(layout):
    for y, row in enumerate(layout):
        for x, symbol in enumerate(row):
            if symbol == '@' or symbol == '+':    # @ if on floor, + if on goal
                return {"x": x, "y": y}
    return None

def get_height_width(layout):
    height = len(layout)
    width = max(map(len, layout))
    return height, width

def parse_save_2jsons(fields_from_json1, fields_from_json2, path2_replace, output_path_replace, jsonPaths1):
    for path1 in jsonPaths1:
        path2 = path1.replace(path2_replace[0], path2_replace[1])
        output_path = path1.replace(output_path_replace[0], output_path_replace[1])

        # Read and parse each JSON file
        json1 = load_json(path1)
        json2 = load_json(path2)

        # Combine two JSONs
        combined_json = fuse_jsons(json1, json2, fields_from_json1, fields_from_json2)

        # get boxes, start position, height, width
        height,width = get_height_width(combined_json['layout'])
        boxes = get_boxes(combined_json['layout'])
        start_position = get_start_position(combined_json['layout'])

        combined_json["width"] = width
        combined_json["height"] = height
        combined_json["start_position"] = start_position
        combined_json["boxes"] = boxes

        print(combined_json)

        # Save the resulting JSON
        save_json(combined_json, output_path)

if __name__ == '__main__':
    # Path to the `web-archive` directory
    INPUT_PATH = os.path.join(os.getcwd(), 'sokobanonline', 'parsedMetaData', 'all', 'web-archive')
    
    # Get all JSON files from the input path
    metadata_json_paths = get_all_json_files(INPUT_PATH)

    # Fields to include from each JSON
    fields_metadata = ['collection_id', 'collection_name', 'level_id', 'level_name', 'author_name', 'author_link', 'puzzle_link', 
                       'glean_timestamp', 'publish date', 'likes', 'dislikes', 'num_played', 'num_solved', 'uniquely_solved', 'top solutions']
    fields_layout = ["layout_string", "layout"]

    # testing
    test_metadata_json_paths = [
        metadata_json_paths[:5]
    ]

    layout_path_replace = ['parsedMetaData/all', 'puzzleLayout/all']
    outputpath_replace = ['parsedMetaData/all', 'test/parsed_stim_sokobanonline'] # original --> to be replaced by

    parse_save_2jsons(fields_metadata, fields_layout, 
                      layout_path_replace, outputpath_replace, 
                      metadata_json_paths)
