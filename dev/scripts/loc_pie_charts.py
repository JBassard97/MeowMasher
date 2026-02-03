#!/usr/bin/env python3
"""
Visualize LOC data as pie charts
Run from project root: python dev/scripts/visualize_loc.py
"""

import json
import matplotlib.pyplot as plt
import os
from pathlib import Path

# Get project root (assumes script is in dev/scripts/)
script_dir = Path(__file__).parent
project_root = script_dir.parent.parent

# Read the LOC data
loc_file = project_root / "src" / "data" / "loc.json"
with open(loc_file, "r") as f:
    data = json.load(f)

# Create output directory if it doesn't exist
output_dir = project_root / "dev" / "outputs"
output_dir.mkdir(parents=True, exist_ok=True)

# Create figure with 3 subplots
fig, axes = plt.subplots(1, 3, figsize=(18, 6))
fig.suptitle(
    f'Lines of Code Analysis - Total: {data["totalLOC"]:,} LOC',
    fontsize=16,
    fontweight="bold",
    y=0.98,
)


# Function to create a pie chart
def create_pie_chart(ax, breakdown_data, title):
    # Extract data
    languages = list(breakdown_data.keys())
    loc_counts = [breakdown_data[lang]["loc"] for lang in languages]

    # Sort by LOC count (descending)
    sorted_indices = sorted(
        range(len(loc_counts)), key=lambda i: loc_counts[i], reverse=True
    )
    languages = [languages[i] for i in sorted_indices]
    loc_counts = [loc_counts[i] for i in sorted_indices]

    # Create pie chart with color palette
    colors = plt.cm.Set3(range(len(languages)))
    wedges, texts, autotexts = ax.pie(
        loc_counts,
        labels=languages,
        autopct="%1.1f%%",
        colors=colors,
        startangle=90,
        textprops={"fontsize": 10},
    )

    # Make percentage text bold and white
    for autotext in autotexts:
        autotext.set_color("white")
        autotext.set_fontweight("bold")
        autotext.set_fontsize(9)

    # Make labels bold
    for text in texts:
        text.set_fontweight("bold")
        text.set_fontsize(10)

    # Add title
    ax.set_title(title, fontsize=14, fontweight="bold", pad=20)

    # Add legend with LOC counts and file counts
    legend_labels = [
        f'{lang}: {breakdown_data[lang]["loc"]:,} LOC ({breakdown_data[lang]["numOfFiles"]} files)'
        for lang in languages
    ]
    ax.legend(
        legend_labels,
        loc="upper left",
        bbox_to_anchor=(0, -0.1),
        fontsize=8,
        frameon=False,
    )


# Create the three pie charts
create_pie_chart(axes[0], data["langBreakdown"], "Overall Language Breakdown")
create_pie_chart(axes[1], data["devLangBreakdown"], "Dev Languages")
create_pie_chart(axes[2], data["prodLangBreakdown"], "Production Languages")

# Adjust layout to prevent overlap
plt.tight_layout(rect=[0, 0, 1, 0.95])

# Save the figure
output_path = output_dir / "loc_visualization.png"
plt.savefig(output_path, dpi=300, bbox_inches="tight", facecolor="white")
print(f"✅ Visualization saved to: {output_path}")

# Also save as SVG for scalability
svg_path = output_dir / "loc_visualization.svg"
plt.savefig(svg_path, bbox_inches="tight", facecolor="white")
print(f"✅ SVG version saved to: {svg_path}")

plt.close()
