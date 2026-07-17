package main

import "testing"

func TestGeneratorPattern(t *testing.T) {
	tests := []struct {
		name string
		src  string
		want []string
	}{
		{
			name: "matches a Resource field",
			src:  "\t\tResource:    \"virtualclusterinstances\",\n",
			want: []string{"virtualclusterinstances"},
		},
		{
			name: "ignores a standalone SubResource field",
			src:  "\t\tSubResource: \"kubeconfig\",\n",
			want: nil,
		},
		{
			name: "matches Resource but not the adjacent SubResource field",
			src:  "\t\tResource:    \"virtualclusterinstances\",\n\t\tSubResource: \"kubeconfig\",\n",
			want: []string{"virtualclusterinstances"},
		},
		{
			name: "matches multiple Resource fields across separate calls",
			src:  "\t\tResource: \"spaceinstances\",\n\t)\n\t...\n\t\tResource: \"projects\",\n",
			want: []string{"spaceinstances", "projects"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			matches := generatorPattern.FindAllStringSubmatch(tt.src, -1)
			var got []string
			for _, m := range matches {
				got = append(got, m[1])
			}

			if len(got) != len(tt.want) {
				t.Fatalf("generatorPattern matches = %v, want %v", got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("generatorPattern matches = %v, want %v", got, tt.want)
				}
			}
		})
	}
}
