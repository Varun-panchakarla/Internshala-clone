const fs = require('fs');
const path = require('path');

// Read existing questions from src/data/important_questions.json
const questionsPath = path.resolve(__dirname, '..', 'src', 'data', 'important_questions.json');
let questions = [];

if (fs.existsSync(questionsPath)) {
  try {
    questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log(`Loaded ${questions.length} existing questions.`);
  } catch (err) {
    console.error('Failed to parse existing important_questions.json:', err.message);
  }
}

// Slice existing array to keep exactly the first 29 questions (to avoid duplicates if run multiple times)
questions = questions.slice(0, 29);

const newQuestions = [
  {
    "id": 30,
    "title": "Longest Consecutive subsequence",
    "shortStatement": "Find the longest consecutive subsequence in an array.",
    "statement": "Given an unsorted array of integers, find the length of the longest consecutive elements sequence.",
    "sampleInput": "6\n100 1 200 3 2 4",
    "sampleOutput": "1 2 3 4",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\n#include <unordered_set>\nusing namespace std;\n\nvector<int> Lcs(vector<int>& arr) {\n    if (arr.empty()) return {};\n    unordered_set<int> num_set(arr.begin(), arr.end());\n    vector<int> longest_seq;\n    for (int num : num_set) {\n        if (num_set.find(num - 1) == num_set.end()) {\n            int current_num = num;\n            vector<int> current_seq = {num};\n            while (num_set.find(current_num + 1) != num_set.end()) {\n                current_num++;\n                current_seq.push_back(current_num);\n            }\n            if (current_seq.size() > longest_seq.size()) {\n                longest_seq = current_seq;\n            }\n        }\n    }\n    return longest_seq;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        vector<int> ans = Lcs(arr);\n        for (int i = 0; i < ans.size(); i++) {\n            cout << ans[i] << (i == ans.size() - 1 ? \"\" : \" \");\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.*;\n\nclass Main {\n    public static List<Integer> Lcs(int[] arr) {\n        if (arr.length == 0) return new ArrayList<>();\n        Set<Integer> num_set = new HashSet<>();\n        for (int x : arr) num_set.add(x);\n        List<Integer> longest_seq = new ArrayList<>();\n        for (int num : num_set) {\n            if (!num_set.contains(num - 1)) {\n                int current_num = num;\n                List<Integer> current_seq = new ArrayList<>();\n                current_seq.add(num);\n                while (num_set.contains(current_num + 1)) {\n                    current_num++;\n                    current_seq.add(current_num);\n                }\n                if (current_seq.size() > longest_seq.size()) {\n                    longest_seq = current_seq;\n                }\n            }\n        }\n        return longest_seq;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            List<Integer> ans = Lcs(arr);\n            for (int i = 0; i < ans.size(); i++) {\n                System.out.print(ans.get(i) + (i == ans.size() - 1 ? \"\" : \" \"));\n            }\n        }\n    }\n}",
      "python": "def Lcs(arr):\n    if not arr:\n        return []\n    num_set = set(arr)\n    longest_seq = []\n    for num in num_set:\n        if num - 1 not in num_set:\n            current_num = num\n            current_seq = [num]\n            while current_num + 1 in num_set:\n                current_num += 1\n                current_seq.append(current_num)\n            if len(current_seq) > len(longest_seq):\n                longest_seq = current_seq\n    return longest_seq\n\narr = [100, 1, 200, 3, 2, 4]\nprint(Lcs(arr))"
    }
  },
  {
    "id": 31,
    "title": "String Compression",
    "shortStatement": "Compress a string by representing duplicate letters with their counts.",
    "statement": "Write a program to compress a string by replacing consecutive duplicate letters with their frequency count (e.g. 'aaabbbccc' -> 'a3b3c3').",
    "sampleInput": "aaabbbccc",
    "sampleOutput": "a3b3c3",
    "solutions": {
      "cpp": "#include <iostream>\n#include <string>\n#include <map>\nusing namespace std;\n\nstring compressedString(string s) {\n    map<char, int> freq;\n    for (char c : s) {\n        freq[c]++;\n    }\n    string result = \"\";\n    for (auto const& [key, val] : freq) {\n        result += key + to_string(val);\n    }\n    return result;\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << compressedString(s);\n    }\n    return 0;\n}",
      "java": "import java.util.*;\n\nclass Main {\n    public static String compressedString(String s) {\n        Map<Character, Integer> freq = new LinkedHashMap<>();\n        for (char c : s.toCharArray()) {\n            freq.put(c, freq.getOrDefault(c, 0) + 1);\n        }\n        StringBuilder result = new StringBuilder();\n        for (Map.Entry<Character, Integer> entry : freq.entrySet()) {\n            result.append(entry.getKey()).append(entry.getValue());\n        }\n        return result.toString();\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(compressedString(s));\n        }\n    }\n}",
      "python": "def compressed_string(s):\n    freq = {}\n    for char in s:\n        freq[char] = freq.get(char, 0) + 1\n    result = \"\"\n    for char, count in freq.items():\n        result += f\"{char}{count}\"\n    return result\n\ns = \"aaabbbccc\"\nprint(compressed_string(s))"
    }
  },
  {
    "id": 32,
    "title": "Bubble Sort",
    "shortStatement": "Sort an array of elements in ascending order using Bubble Sort.",
    "statement": "Write a program to sort an array of elements in ascending order using Bubble Sort.",
    "sampleInput": "5\n100 2 5 1 200",
    "sampleOutput": "1 2 5 100 200",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid bubbleSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j+1]) {\n                swap(arr[j], arr[j+1]);\n            }\n        }\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        bubbleSort(arr);\n        for (int i = 0; i < n; i++) {\n            cout << arr[i] << (i == n - 1 ? \"\" : \" \");\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j+1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j+1];\n                    arr[j+1] = temp;\n                }\n            }\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            bubbleSort(arr);\n            for (int i = 0; i < n; i++) {\n                System.out.print(arr[i] + (i == n - 1 ? \"\" : \" \"));\n            }\n        }\n    }\n}",
      "python": "def bubble(arr):\n    for i in range(len(arr)):\n        for j in range(0, len(arr) - i - 1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\narr = [100,2,5,1,200]\nprint(bubble(arr))"
    }
  },
  {
    "id": 33,
    "title": "Selection Sort",
    "shortStatement": "Sort an array of elements in ascending order using Selection Sort.",
    "statement": "Write a program to sort an array of elements in ascending order using Selection Sort.",
    "sampleInput": "5\n-2 45 0 11 -9",
    "sampleOutput": "-9 -2 0 11 45",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid selectionSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int step = 0; step < n; step++) {\n        int min_idx = step;\n        for (int i = step + 1; i < n; i++) {\n            if (arr[i] < arr[min_idx]) {\n                min_idx = i;\n            }\n        }\n        swap(arr[step], arr[min_idx]);\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        selectionSort(arr);\n        for (int i = 0; i < n; i++) {\n            cout << arr[i] << (i == n - 1 ? \"\" : \" \");\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void selectionSort(int[] arr) {\n        int n = arr.length;\n        for (int step = 0; step < n; step++) {\n            int min_idx = step;\n            for (int i = step + 1; i < n; i++) {\n                if (arr[i] < arr[min_idx]) {\n                    min_idx = i;\n                }\n            }\n            int temp = arr[step];\n            arr[step] = arr[min_idx];\n            arr[min_idx] = temp;\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            selectionSort(arr);\n            for (int i = 0; i < n; i++) {\n                System.out.print(arr[i] + (i == n - 1 ? \"\" : \" \"));\n            }\n        }\n    }\n}",
      "python": "def selectionSort(array, size):\n    for step in range(size):\n        min_idx = step\n        for i in range(step + 1, size):\n            if array[i] < array[min_idx]:\n                min_idx = i\n        (array[step], array[min_idx]) = (array[min_idx], array[step])\n\ndata = [-2, 45, 0, 11, -9]\nselectionSort(data, len(data))\nprint(data)"
    }
  },
  {
    "id": 34,
    "title": "Matrix addition",
    "shortStatement": "Add two 2D matrices of equivalent dimensions.",
    "statement": "Write a program to compute the sum of corresponding elements in two matrices of equivalent dimensions.",
    "sampleInput": "2 2\n1 2\n4 5\n7 8\n9 10",
    "sampleOutput": "8 10\n13 15",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std; \n\nint main() {\n    int r, c;\n    if (cin >> r >> c) {\n        vector<vector<int>> X(r, vector<int>(c));\n        vector<vector<int>> Y(r, vector<int>(c));\n        for (int i = 0; i < r; i++)\n            for (int j = 0; j < c; j++) cin >> X[i][j];\n        for (int i = 0; i < r; i++)\n            for (int j = 0; j < c; j++) cin >> Y[i][j];\n            \n        for (int i = 0; i < r; i++) {\n            for (int j = 0; j < c; j++) {\n                cout << X[i][j] + Y[i][j] << (j == c - 1 ? \"\" : \" \");\n            }\n            cout << \"\\n\";\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int r = sc.nextInt();\n            int c = sc.nextInt();\n            int[][] X = new int[r][c];\n            int[][] Y = new int[r][c];\n            for (int i = 0; i < r; i++)\n                for (int j = 0; j < c; j++) X[i][j] = sc.nextInt();\n            for (int i = 0; i < r; i++)\n                for (int j = 0; j < c; j++) Y[i][j] = sc.nextInt();\n                \n            for (int i = 0; i < r; i++) {\n                for (int j = 0; j < c; j++) {\n                    System.out.print((X[i][j] + Y[i][j]) + (j == c - 1 ? \"\" : \" \"));\n                }\n                System.out.println();\n            }\n        }\n    }\n}",
      "python": "X = [[1, 2], [4, 5]]\nY = [[7, 8], [9, 10]]\nresult = [[X[i][j] + Y[i][j] for j in range(len(X[0]))] for i in range(len(X))]\nfor row in result:\n    print(row)"
    }
  },
  {
    "id": 35,
    "title": "Sum of N prime numbers",
    "shortStatement": "Calculate the sum of the first N prime numbers.",
    "statement": "Write a program to calculate the sum of the first N prime numbers starting from 2.",
    "sampleInput": "10",
    "sampleOutput": "129",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nbool is_prime(int num) {\n    if (num < 2) return false;\n    for (int i = 2; i * i <= num; i++) {\n        if (num % i == 0) return false;\n    }\n    return true;\n}\n\nint sum_prime(int n) {\n    int prime_sum = 0, count = 0, current_num = 2;\n    while (count < n) {\n        if (is_prime(current_num)) {\n            prime_sum += current_num;\n            count++;\n        }\n        current_num++;\n    }\n    return prime_sum;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << sum_prime(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static boolean isPrime(int num) {\n        if (num < 2) return false;\n        for (int i = 2; i * i <= num; i++) {\n            if (num % i == 0) return false;\n        }\n        return true;\n    }\n\n    public static int sumPrime(int n) {\n        int sum = 0, count = 0, current = 2;\n        while (count < n) {\n            if (isPrime(current)) {\n                sum += current;\n                count++;\n            }\n            current++;\n        }\n        return sum;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(sumPrime(n));\n        }\n    }\n}",
      "python": "import math\ndef is_prime(num):\n    if num < 2:\n        return False\n    for i in range(2, int(math.sqrt(num)) + 1):\n        if num % i == 0:\n            return False\n    return True\ndef sum_prime(n):\n    prime_sum = 0\n    count = 0\n    current_num = 2\n    while count < n:\n        if is_prime(current_num):\n            prime_sum += current_num \n            count += 1\n        current_num += 1\n    return prime_sum\n\nnum = 10\nprint(sum_prime(num))"
    }
  },
  {
    "id": 36,
    "title": "Transpose of the matrix",
    "shortStatement": "Transpose a given 2D grid matrix.",
    "statement": "Write a program to transpose a given grid matrix of dimensions R x C into C x R.",
    "sampleInput": "3 2\n1 2\n4 5\n7 8",
    "sampleOutput": "1 4 7\n2 5 8",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int r, c;\n    if (cin >> r >> c) {\n        vector<vector<int>> X(r, vector<int>(c));\n        for (int i = 0; i < r; i++)\n            for (int j = 0; j < c; j++) cin >> X[i][j];\n            \n        for (int j = 0; j < c; j++) {\n            for (int i = 0; i < r; i++) {\n                cout << X[i][j] << (i == r - 1 ? \"\" : \" \");\n            }\n            cout << \"\\n\";\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int r = sc.nextInt();\n            int c = sc.nextInt();\n            int[][] X = new int[r][c];\n            for (int i = 0; i < r; i++)\n                for (int j = 0; j < c; j++) X[i][j] = sc.nextInt();\n                \n            for (int j = 0; j < c; j++) {\n                for (int i = 0; i < r; i++) {\n                    System.out.print(X[i][j] + (i == r - 1 ? \"\" : \" \"));\n                }\n                System.out.println();\n            }\n        }\n    }\n}",
      "python": "X = [[1, 2], [4, 5], [7, 8]]\nresult = [list(row) for row in zip(*X)]\nprint(result)"
    }
  },
  {
    "id": 37,
    "title": "Count Frequency of Element in Array",
    "shortStatement": "Count frequency of each unique element in an array.",
    "statement": "Write a program to count the occurrences/frequency of each unique element in a given integer array.",
    "sampleInput": "10\n1 2 2 3 3 3 4 4 4 4",
    "sampleOutput": "{1: 1, 2: 2, 3: 3, 4: 4}",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\n#include <map>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        map<int, int> freq;\n        for (int i = 0; i < n; i++) {\n            cin >> arr[i];\n            freq[arr[i]]++;\n        }\n        cout << \"{\";\n        int count = 0;\n        for (auto const& [key, val] : freq) {\n            cout << key << \": \" << val << (count++ == freq.size() - 1 ? \"\" : \", \");\n        }\n        cout << \"}\";\n    }\n    return 0;\n}",
      "java": "import java.util.*;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            Map<Integer, Integer> freq = new TreeMap<>();\n            for (int i = 0; i < n; i++) {\n                arr[i] = sc.nextInt();\n                freq.put(arr[i], freq.getOrDefault(arr[i], 0) + 1);\n            }\n            System.out.print(\"{\");\n            int count = 0;\n            for (Map.Entry<Integer, Integer> entry : freq.entrySet()) {\n                System.out.print(entry.getKey() + \": \" + entry.getValue() + (count++ == freq.size() - 1 ? \"\" : \", \"));\n            }\n            System.out.println(\"}\");\n        }\n    }\n}",
      "python": "arr = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]\nfreq_dict = {}\nfor item in arr:\n    if item in freq_dict:\n        freq_dict[item] += 1\n    else:\n        freq_dict[item] = 1\nprint(freq_dict)"
    }
  },
  {
    "id": 38,
    "title": "Check if Array is sorted",
    "shortStatement": "Determine if an array is sorted in non-decreasing order.",
    "statement": "Write a program to check if an array of integers is sorted in ascending/non-decreasing order.",
    "sampleInput": "11\n1 2 2 3 3 3 4 4 4 4 1",
    "sampleOutput": "False",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nbool is_sorted(vector<int>& arr) {\n    for (int i = 0; i < arr.size() - 1; i++) {\n        if (arr[i] > arr[i+1]) return false;\n    }\n    return true;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        cout << (is_sorted(arr) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static boolean isSorted(int[] arr) {\n        for (int i = 0; i < arr.length - 1; i++) {\n            if (arr[i] > arr[i+1]) return false;\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            System.out.println(isSorted(arr) ? \"True\" : \"False\");\n        }\n    }\n}",
      "python": "def is_sorted(arr):\n    for i in range(len(arr) - 1):\n        if arr[i] > arr[i+1]:\n            return False\n    return True\n\narr = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 1]\nprint(is_sorted(arr))"
    }
  },
  {
    "id": 39,
    "title": "Merge Two Arrays",
    "shortStatement": "Merge two arrays into a single combined array.",
    "statement": "Write a program to concatenate or merge two arrays together into a single array.",
    "sampleInput": "3\n1 2 3\n3\n4 5 6",
    "sampleOutput": "1 2 3 4 5 6",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n1, n2;\n    if (cin >> n1) {\n        vector<int> arr1(n1);\n        for (int i = 0; i < n1; i++) cin >> arr1[i];\n        cin >> n2;\n        vector<int> arr2(n2);\n        for (int i = 0; i < n2; i++) cin >> arr2[i];\n        \n        vector<int> merged;\n        merged.reserve(n1 + n2);\n        merged.insert(merged.end(), arr1.begin(), arr1.end());\n        merged.insert(merged.end(), arr2.begin(), arr2.end());\n        \n        for (int i = 0; i < merged.size(); i++) {\n            cout << merged[i] << (i == merged.size() - 1 ? \"\" : \" \");\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n1 = sc.nextInt();\n            int[] arr1 = new int[n1];\n            for (int i = 0; i < n1; i++) arr1[i] = sc.nextInt();\n            int n2 = sc.nextInt();\n            int[] arr2 = new int[n2];\n            for (int i = 0; i < n2; i++) arr2[i] = sc.nextInt();\n            \n            int[] merged = new int[n1 + n2];\n            System.arraycopy(arr1, 0, merged, 0, n1);\n            System.arraycopy(arr2, 0, merged, n1, n2);\n            \n            for (int i = 0; i < merged.length; i++) {\n                System.out.print(merged[i] + (i == merged.length - 1 ? \"\" : \" \"));\n            }\n        }\n    }\n}",
      "python": "def merge(arr1, arr2):\n    return arr1 + arr2\n\narr1 = [1,2,3]\narr2 = [4,5,6]\nprint(merge(arr1, arr2))"
    }
  },
  {
    "id": 40,
    "title": "Find Missing number in an array",
    "shortStatement": "Identify the missing number in an array from 1 to N.",
    "statement": "Given an array containing integers from 1 to N where one number is missing, find the missing integer.",
    "sampleInput": "4\n1 2 3 5",
    "sampleOutput": "4",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\n#include <numeric>\nusing namespace std;\n\nint missingNumber(vector<int>& arr) {\n    int n = arr.size() + 1;\n    int expected = (n * (n + 1)) / 2;\n    int actual = accumulate(arr.begin(), arr.end(), 0);\n    return expected - actual;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        cout << missingNumber(arr);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static int missingNumber(int[] arr) {\n        int n = arr.length + 1;\n        int expected = (n * (n + 1)) / 2;\n        int actual = 0;\n        for (int x : arr) actual += x;\n        return expected - actual;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            System.out.println(missingNumber(arr));\n        }\n    }\n}",
      "python": "def missing_number(arr):\n    n = len(arr)+1\n    expected_sum = (n*(n+1)) // 2\n    actual_sum = sum(arr)\n    return expected_sum - actual_sum\n\narr = [1,2,3,5]\nprint(missing_number(arr))"
    }
  },
  {
    "id": 41,
    "title": "Kadanes Algorithm",
    "shortStatement": "Find the maximum subarray sum using Kadane's algorithm.",
    "statement": "Given an array of integers, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    "sampleInput": "4\n-2 7 -4 5",
    "sampleOutput": "8",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <climits>\nusing namespace std;\n\nint kadanes(vector<int>& arr) {\n    int curr_sum = 0;\n    int max_sum = INT_MIN;\n    for (int i = 0; i < arr.size(); i++) {\n        curr_sum += arr[i];\n        max_sum = max(max_sum, curr_sum);\n        if (curr_sum < 0) {\n            curr_sum = 0;\n        }\n    }\n    return max_sum;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        cout << kadanes(arr);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static int kadanes(int[] arr) {\n        int curr_sum = 0;\n        int max_sum = Integer.MIN_VALUE;\n        for (int i = 0; i < arr.length; i++) {\n            curr_sum += arr[i];\n            max_sum = Math.max(max_sum, curr_sum);\n            if (curr_sum < 0) {\n                curr_sum = 0;\n            }\n        }\n        return max_sum;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            System.out.println(kadanes(arr));\n        }\n    }\n}",
      "python": "def kadanes(arr):\n    curr_sum = 0\n    max_sum = float(\"-inf\")\n    for i in range(len(arr)):\n        curr_sum += arr[i]\n        max_sum = max(max_sum, curr_sum)\n        if curr_sum < 0:\n            curr_sum = 0\n    return max_sum\n\narr = [-2,7,-4,5]\nprint(kadanes(arr))"
    }
  },
  {
    "id": 42,
    "title": "Hollow Rectangle",
    "shortStatement": "Print a hollow square or rectangle asterisk pattern.",
    "statement": "Write a program to render a hollow square asterisk border pattern of dimension N.",
    "sampleInput": "5",
    "sampleOutput": "* * * * *\n*       *\n*       *\n*       *\n* * * * *",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            if (i == 0 || j == 0 || i == n-1 || j == n-1) {\n                cout << \"* \";\n            } else {\n                cout << \"  \";\n            }\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                if (i == 0 || j == 0 || i == n - 1 || j == n - 1) {\n                    System.out.print(\"* \");\n                } else {\n                    System.out.print(\"  \");\n                }\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    for i in range(n):\n        for j in range(n):\n            if i == 0 || j == 0 || i == n-1 || j == n-1:\n                print('*', end = ' ')\n            else:\n                print(' ', end = ' ')\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 43,
    "title": "Right-angle triangle",
    "shortStatement": "Print a standard right-angle triangle asterisk pattern.",
    "statement": "Write a program to render a right-angle triangle asterisk pattern of dimension N.",
    "sampleInput": "5",
    "sampleOutput": "*\n* *\n* * *\n* * * *\n* * * * *",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j <= i; j++) {\n            cout << \"* \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j <= i; j++) {\n                System.out.print(\"* \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    for i in range(n):\n        for j in range(i+1):\n            print('*', end = ' ')\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 44,
    "title": "Right angle triangle with numbers in sequence",
    "shortStatement": "Print a right-angle triangle with numeric rows.",
    "statement": "Write a program to render a right-angle triangle of numbers in sequence up to N.",
    "sampleInput": "5",
    "sampleOutput": "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) {\n            cout << j << \" \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print(j + \" \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    for i in range(1, n+1):\n        for j in range(1, i+1):\n            print(j, end = ' ')\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 45,
    "title": "Reverse Right angle triangle",
    "shortStatement": "Print an inverted right-angle triangle asterisk pattern.",
    "statement": "Write a program to render a reversed/inverted right-angle triangle asterisk pattern.",
    "sampleInput": "5",
    "sampleOutput": "* * * * *\n* * * *\n* * *\n* *\n*",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n - i; j++) {\n            cout << \"* \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n - i; j++) {\n                System.out.print(\"* \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    for i in range(n):\n        for j in range(n-i):\n            print('*', end = ' ')\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 46,
    "title": "Reversed Right angle triangle with numbers in sequence",
    "shortStatement": "Print an inverted right-angle triangle of numbers.",
    "statement": "Write a program to render an inverted right-angle triangle of sequential numbers.",
    "sampleInput": "5",
    "sampleOutput": "1 2 3 4 5\n1 2 3 4\n1 2 3\n1 2\n1",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= n - i + 1; j++) {\n            cout << j << \" \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= n - i + 1; j++) {\n                System.out.print(j + \" \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    for i in range(1, n+1):\n        for j in range(1, n-i+2):\n            print(j, end = ' ')\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 47,
    "title": "Pyramid pattern",
    "shortStatement": "Print a standard centered pyramid asterisk pattern.",
    "statement": "Write a program to render a centered pyramid pattern of dimension N.",
    "sampleInput": "5",
    "sampleOutput": "        *\n      * * *\n    * * * * *\n  * * * * * * *\n* * * * * * * * *",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pyramid(int n) {\n    for (int i = 1; i <= n; i++) {\n        for (int j = 0; j < n - i; j++) {\n            cout << \"  \";\n        }\n        for (int k = 1; k < 2 * i; k++) {\n            cout << \"* \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pyramid(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pyramid(int n) {\n        for (int i = 1; i <= n; i++) {\n            for (int j = 0; j < n - i; j++) {\n                System.out.print(\"  \");\n            }\n            for (int k = 1; k < 2 * i; k++) {\n                System.out.print(\"* \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pyramid(n);\n        }\n    }\n}",
      "python": "def pyramid(n):\n    for i in range(1, n+1):\n        for j in range(n-i):\n            print(' ', end = ' ')\n        for k in range(1, 2*i):\n            print('*', end = ' ')\n        print()\n\nn = 5\npyramid(n)"
    }
  },
  {
    "id": 48,
    "title": "Triangle pattern",
    "shortStatement": "Print a sideways pointing triangle pattern.",
    "statement": "Write a program to render a sideways (pointing right) triangle pattern of size N.",
    "sampleInput": "5",
    "sampleOutput": "* \n* * \n* * * \n* * * * \n* * * * * \n* * * * \n* * * \n* * \n*",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 1; i < 2 * n; i++) {\n        int star = i;\n        if (i > n) {\n            star = 2 * n - i;\n        }\n        for (int j = 0; j < star; j++) {\n            cout << \"* \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 1; i < 2 * n; i++) {\n            int star = i;\n            if (i > n) {\n                star = 2 * n - i;\n            }\n            for (int j = 0; j < star; j++) {\n                System.out.print(\"* \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    for i in range(1, 2*n):\n        star = i\n        if i > n:\n            star = 2*n - i\n        for j in range(star):\n            print('*', end = ' ')\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 49,
    "title": "Number pattern with 1 and 0",
    "shortStatement": "Print a triangle of alternating 1s and 0s.",
    "statement": "Write a program to render a right-angle triangle pattern of alternating 1s and 0s starting with 1.",
    "sampleInput": "5",
    "sampleOutput": "1\n0 1\n1 0 1\n0 1 0 1\n1 0 1 0 1",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 0; i < n; i++) {\n        int start = (i % 2 == 0) ? 1 : 0;\n        for (int j = 0; j <= i; j++) {\n            cout << start << \" \";\n            start = 1 - start;\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 0; i < n; i++) {\n            int start = (i % 2 == 0) ? 1 : 0;\n            for (int j = 0; j <= i; j++) {\n                System.out.print(start + \" \");\n                start = 1 - start;\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    start = 1\n    for i in range(n):\n        if i % 2 == 0:\n            start = 1\n        else:\n            start = 0\n        for j in range(i+1):\n            print(start, end = ' ')\n            start = 1 - start\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 50,
    "title": "Number sequence pattern",
    "shortStatement": "Print a triangle with progressive numeric values (Floyd's triangle).",
    "statement": "Write a program to render a right-angle triangle pattern of progressive sequential numbers (Floyd's triangle).",
    "sampleInput": "5",
    "sampleOutput": "1\n2 3\n4 5 6\n7 8 9 10\n11 12 13 14 15",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    int num = 1;\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) {\n            cout << num++ << \" \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        int num = 1;\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print(num++ + \" \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    num = 1\n    for i in range(1, n+1):\n        for j in range(1, i+1):\n            print(num, end = ' ')\n            num += 1\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 51,
    "title": "Alphabetics Sequence",
    "shortStatement": "Print a progressive alphabetic sequence in a triangle.",
    "statement": "Write a program to render a right-angle triangle pattern of progressive letters starting with 'A'.",
    "sampleInput": "5",
    "sampleOutput": "A\nB C\nD E F\nG H I J\nK L M N O",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    char ch = 'A';\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) {\n            cout << ch++ << \" \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        char ch = 'A';\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print(ch++ + \" \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    char = ord('A')\n    for i in range(1, n+1):\n        for j in range(1, i+1):\n            print(chr(char), end = ' ')\n            char += 1\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 52,
    "title": "Alphabetics Sequence2",
    "shortStatement": "Print letters starting with 'A' on each row.",
    "statement": "Write a program to render a right-angle triangle pattern of alphabetic characters where each row resets to start with 'A'.",
    "sampleInput": "5",
    "sampleOutput": "A\nA B\nA B C\nA B C D\nA B C D E",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 1; i <= n; i++) {\n        char ch = 'A';\n        for (int j = 0; j < i; j++) {\n            cout << ch++ << \" \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 1; i <= n; i++) {\n            char ch = 'A';\n            for (int j = 0; j < i; j++) {\n                System.out.print(ch++ + \" \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    for i in range(1, n+1):\n        char = ord('A')\n        for j in range(i):\n            print(chr(char), end = ' ')\n            char += 1\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 53,
    "title": "Alphabetics Sequence3",
    "shortStatement": "Print inverted triangle of letters starting with 'A' on each row.",
    "statement": "Write a program to render an inverted right-angle triangle of alphabetic characters where each row resets to start with 'A'.",
    "sampleInput": "5",
    "sampleOutput": "A B C D E\nA B C D\nA B C\nA B\nA",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pattern(int n) {\n    for (int i = 1; i <= n; i++) {\n        char ch = 'A';\n        for (int j = 1; j <= n - i + 1; j++) {\n            cout << ch++ << \" \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pattern(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pattern(int n) {\n        for (int i = 1; i <= n; i++) {\n            char ch = 'A';\n            for (int j = 1; j <= n - i + 1; j++) {\n                System.out.print(ch++ + \" \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pattern(n);\n        }\n    }\n}",
      "python": "def pattern(n):\n    for i in range(1, n+1):\n        char = ord('A')\n        for j in range(1, n-i+2):\n            print(chr(char), end = ' ')\n            char += 1\n        print()\n\nn = 5\npattern(n)"
    }
  },
  {
    "id": 54,
    "title": "Pyramid with alphabets",
    "shortStatement": "Print a progressive alphabetic centered pyramid pattern.",
    "statement": "Write a program to render a centered pyramid pattern of progressive letters starting with 'A'.",
    "sampleInput": "5",
    "sampleOutput": "        A\n      B C D\n    E F G H I\n  J K L M N O P\nQ R S T U V W X Y",
    "solutions": {
      "cpp": "#include <iostream>\nusing namespace std;\n\nvoid pyramid(int n) {\n    char ch = 'A';\n    for (int i = 1; i <= n; i++) {\n        for (int j = 0; j < n - i; j++) {\n            cout << \"  \";\n        }\n        for (int k = 1; k < 2 * i; k++) {\n            cout << ch++ << \" \";\n        }\n        cout << \"\\n\";\n    }\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        pyramid(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static void pyramid(int n) {\n        char ch = 'A';\n        for (int i = 1; i <= n; i++) {\n            for (int j = 0; j < n - i; j++) {\n                System.out.print(\"  \");\n            }\n            for (int k = 1; k < 2 * i; k++) {\n                System.out.print(ch++ + \" \");\n            }\n            System.out.println();\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            pyramid(n);\n        }\n    }\n}",
      "python": "def pyramid(n):\n    char = ord('A')\n    for i in range(1, n+1):\n        for j in range(n-i):\n            print(' ', end = ' ')\n        for k in range(1, 2*i):\n            print(chr(char), end = ' ')\n            char += 1\n        print()\n\nn = 5\npyramid(n)"
    }
  },
  {
    "id": 55,
    "title": "Gym fee calculator",
    "shortStatement": "Calculate optimal gym membership fee based on total months input.",
    "statement": "Given a total number of membership months n (where n must be a multiple of 3 or 1), calculate the total fee using plans:\n12 months: 15000, 9 months: 12000, 6 months: 9000, 3 months: 5000, 1 month: 2000.",
    "sampleInput": "15",
    "sampleOutput": "20000",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint gym_fee(int n) {\n    if (n != 1 && n != 3 && n != 6 && n != 9 && n != 12 && n % 3 != 0) {\n        return -1;\n    }\n    vector<pair<int, int>> plans = {{12, 15000}, {9, 12000}, {6, 9000}, {3, 5000}, {1, 2000}};\n    int total = 0;\n    for (auto const& [m, c] : plans) {\n        while (n >= m) {\n            total += c;\n            n -= m;\n        }\n    }\n    return total;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        int ans = gym_fee(n);\n        if (ans == -1) cout << \"Error\";\n        else cout << ans;\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static int gymFee(int n) {\n        if (n != 1 && n != 3 && n != 6 && n != 9 && n != 12 && n % 3 != 0) {\n            return -1;\n        }\n        int[][] plans = {{12, 15000}, {9, 12000}, {6, 9000}, {3, 5000}, {1, 2000}};\n        int total = 0;\n        for (int[] plan : plans) {\n            int m = plan[0];\n            int c = plan[1];\n            while (n >= m) {\n                total += c;\n                n -= m;\n            }\n        }\n        return total;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int ans = gymFee(n);\n            if (ans == -1) System.out.println(\"Error\");\n            else System.out.println(ans);\n        }\n    }\n}",
      "python": "def gym_fee(n):\n    if n not in [1,3,6,9,12] and n % 3 != 0:\n        return \"Error\"\n    plans = [(12, 15000), (9, 12000), (6, 9000), (3, 5000), (1, 2000)]\n    total = 0\n    for m, c in plans:\n        while n >= m:\n            total += c\n            n -= m\n    return total\n\nn = int(input())\nprint(gym_fee(n))"
    }
  },
  {
    "id": 56,
    "title": "Leaders",
    "shortStatement": "Find all leader elements in an integer array.",
    "statement": "An element is a leader if it is greater than or equal to all the elements to its right side. The rightmost element is always a leader.",
    "sampleInput": "6\n16 17 4 3 5 2",
    "sampleOutput": "17 5 2",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvector<int> leaders(vector<int>& arr) {\n    int n = arr.size();\n    int right = arr[n-1];\n    vector<int> lead = {right};\n    for (int i = n - 2; i >= 0; i--) {\n        if (arr[i] >= right) {\n            right = arr[i];\n            lead.push_back(arr[i]);\n        }\n    }\n    reverse(lead.begin(), lead.end());\n    return lead;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        vector<int> ans = leaders(arr);\n        for (int i = 0; i < ans.size(); i++) {\n            cout << ans[i] << (i == ans.size() - 1 ? \"\" : \" \");\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.*;\n\nclass Main {\n    public static List<Integer> leaders(int[] arr) {\n        int n = arr.length;\n        int right = arr[n-1];\n        List<Integer> lead = new ArrayList<>();\n        lead.add(right);\n        for (int i = n - 2; i >= 0; i--) {\n            if (arr[i] >= right) {\n                right = arr[i];\n                lead.add(arr[i]);\n            }\n        }\n        Collections.reverse(lead);\n        return lead;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            List<Integer> ans = leaders(arr);\n            for (int i = 0; i < ans.size(); i++) {\n                System.out.print(ans.get(i) + (i == ans.size() - 1 ? \"\" : \" \"));\n            }\n        }\n    }\n}",
      "python": "def leaders(arr):\n    n = len(arr)\n    right = arr[-1]\n    leaders = []\n    leaders.append(right)\n    for i in range(n-2,-1,-1):\n        if arr[i] >= right:\n            right = arr[i]\n            leaders.append(arr[i])\n    return leaders[::-1]\n\nn = int(input().strip())\narr = list(map(int, input().split(' ')))\nprint(leaders(arr))"
    }
  },
  {
    "id": 57,
    "title": "Kings Army",
    "shortStatement": "King's army arrangement generator recursion problem.",
    "statement": "Generate arrangements of army formations of size N using ranges [1, R] where consecutive slots cannot have identical rank and the final rank matches 'end'.",
    "sampleInput": "3 3 2",
    "sampleOutput": "2",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint n, r, endVal;\nint countArrangements = 0;\nvector<int> arr;\n\nvoid generateFormations(int pos) {\n    if (pos == n) {\n        if (arr[n-1] == endVal) {\n            countArrangements++;\n        }\n        return;\n    }\n    for (int i = 1; i <= r; i++) {\n        if (i == arr[pos-1]) continue;\n        arr[pos] = i;\n        generateFormations(pos + 1);\n    }\n}\n\nint main() {\n    if (cin >> n >> r >> endVal) {\n        arr.resize(n, 0);\n        arr[0] = 1;\n        if (n == 1) {\n            cout << (endVal == 1 ? 1 : 0);\n        } else {\n            generateFormations(1);\n            cout << countArrangements;\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    static int n, r, endVal;\n    static int countArrangements = 0;\n    static int[] arr;\n\n    static void generateFormations(int pos) {\n        if (pos == n) {\n            if (arr[n-1] == endVal) {\n                countArrangements++;\n            }\n            return;\n        }\n        for (int i = 1; i <= r; i++) {\n            if (i == arr[pos-1]) continue;\n            arr[pos] = i;\n            generateFormations(pos + 1);\n        }\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            n = sc.nextInt();\n            r = sc.nextInt();\n            endVal = sc.nextInt();\n            arr = new int[n];\n            arr[0] = 1;\n            if (n == 1) {\n                System.out.println(endVal == 1 ? 1 : 0);\n            } else {\n                generateFormations(1);\n                System.out.println(countArrangements);\n            }\n        }\n    }\n}",
      "python": "n, r, end = map(int, input().split())\narr = [0] * n\ncount = 0\n\ndef generate(pos):\n    global count\n    if pos == n:\n        if arr[n-1] == end:\n            count += 1\n        return\n    for i in range(1, r + 1):\n        if i == arr[pos-1]:\n            continue\n        arr[pos] = i\n        generate(pos + 1)\narr[0] = 1\nif n == 1:\n    print(1 if end == 1 else 0)\nelse:\n    generate(1)\n    print(count)"
    }
  },
  {
    "id": 58,
    "title": "Quick sort",
    "shortStatement": "Sort an array of elements in ascending order using Quick Sort.",
    "statement": "Write a program to sort an array of elements in ascending order using Quick Sort.",
    "sampleInput": "6\n1 2 7 4 3 5",
    "sampleOutput": "1 2 3 4 5 7",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> quickSort(vector<int> arr) {\n    if (arr.size() <= 1) return arr;\n    int pivot = arr[arr.size() / 2];\n    vector<int> left, middle, right;\n    for (int x : arr) {\n        if (x < pivot) left.push_back(x);\n        else if (x == pivot) middle.push_back(x);\n        else right.push_back(x);\n    }\n    vector<int> sortedLeft = quickSort(left);\n    vector<int> sortedRight = quickSort(right);\n    sortedLeft.insert(sortedLeft.end(), middle.begin(), middle.end());\n    sortedLeft.insert(sortedLeft.end(), sortedRight.begin(), sortedRight.end());\n    return sortedLeft;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        vector<int> ans = quickSort(arr);\n        for (int i = 0; i < n; i++) {\n            cout << ans[i] << (i == n - 1 ? \"\" : \" \");\n        }\n    }\n    return 0;\n}",
      "java": "import java.util.*;\n\nclass Main {\n    public static List<Integer> quickSort(List<Integer> arr) {\n        if (arr.size() <= 1) return arr;\n        int pivot = arr.get(arr.size() / 2);\n        List<Integer> left = new ArrayList<>();\n        List<Integer> middle = new ArrayList<>();\n        List<Integer> right = new ArrayList<>();\n        for (int x : arr) {\n            if (x < pivot) left.add(x);\n            else if (x == pivot) middle.add(x);\n            else right.add(x);\n        }\n        List<Integer> sorted = new ArrayList<>(quickSort(left));\n        sorted.addAll(middle);\n        sorted.addAll(quickSort(right));\n        return sorted;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            List<Integer> arr = new ArrayList<>();\n            for (int i = 0; i < n; i++) arr.add(sc.nextInt());\n            List<Integer> ans = quickSort(arr);\n            for (int i = 0; i < ans.size(); i++) {\n                System.out.print(ans.get(i) + (i == ans.size() - 1 ? \"\" : \" \"));\n            }\n        }\n    }\n}",
      "python": "def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\nmy_list = [1, 2, 7, 4, 3, 5]\nprint(quick_sort(my_list))"
    }
  },
  {
    "id": 59,
    "title": "max sum",
    "shortStatement": "Find the maximum sum of subarray elements matching bounds.",
    "statement": "Given an array, output the maximum sum generated by combinations of elements under max_sum parameter constraints.",
    "sampleInput": "4\n1 2 3 4\n5",
    "sampleOutput": "4",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std; \n\nint max_summ(vector<int>& arr, int max_sum) {\n    int best_sum = -1;\n    int n = arr.size();\n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            int sum = arr[i] + arr[j];\n            if (sum <= max_sum) {\n                if (sum > best_sum) best_sum = sum;\n            }\n        }\n    }\n    if (best_sum != -1) return best_sum;\n    int max_val = -1;\n    for (int x : arr) {\n        if (x <= max_sum && x > max_val) max_val = x;\n    }\n    return max_val;\n}\n\nint main() {\n    int n, max_sum;\n    if (cin >> n) {\n        vector<int> arr(n);\n        for (int i = 0; i < n; i++) cin >> arr[i];\n        cin >> max_sum;\n        int ans = max_summ(arr, max_sum);\n        if (ans == -1) cout << \"No valid sum\";\n        else cout << ans;\n    }\n    return 0;\n}",
      "java": "import java.util.*;\n\nclass Main {\n    public static int maxSum(int[] arr, int max_sum) {\n        int best_sum = -1;\n        int n = arr.length;\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                int sum = arr[i] + arr[j];\n                if (sum <= max_sum) {\n                    if (sum > best_sum) best_sum = sum;\n                }\n            }\n        }\n        if (best_sum != -1) return best_sum;\n        int max_val = -1;\n        for (int x : arr) {\n            if (x <= max_sum && x > max_val) max_val = x;\n        }\n        return max_val;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] arr = new int[n];\n            for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n            int max_sum = sc.nextInt();\n            int ans = maxSum(arr, max_sum);\n            if (ans == -1) System.out.println(\"No valid sum\");\n            else System.out.println(ans);\n        }\n    }\n}",
      "python": "def max_summ(arr, max_sum):\n    best_sum = -1\n    for i in range(len(arr)):\n        for j in range(i+1, len(arr)):\n            summ = arr[i] + arr[j]\n            if summ <= max_sum:\n                if summ > best_sum:\n                    best_sum = summ\n    if best_sum != -1:\n        return best_sum\n    else:\n        valid_elements = [x for x in arr if x <= max_sum]\n        return max(valid_elements) if valid_elements else \"No valid sum\"\n\n# sample call print\nprint(max_summ([1,2,3,4], 5))"
    }
  },
  {
    "id": 60,
    "title": "decimal to binary",
    "shortStatement": "Convert a base-10 decimal number to binary.",
    "statement": "Write a program to convert a positive decimal (base-10) integer into a binary (base-2) string.",
    "sampleInput": "10",
    "sampleOutput": "1010",
    "solutions": {
      "cpp": "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nstring decimal_binary(int n) {\n    if (n == 0) return \"0\";\n    string binary = \"\";\n    while (n > 0) {\n        binary += to_string(n % 2);\n        n /= 2;\n    }\n    reverse(binary.begin(), binary.end());\n    return binary;\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << decimal_binary(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static String decimalBinary(int n) {\n        if (n == 0) return \"0\";\n        StringBuilder binary = new StringBuilder();\n        while (n > 0) {\n            binary.append(n % 2);\n            n /= 2;\n        }\n        return binary.reverse().toString();\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(decimalBinary(n));\n        }\n    }\n}",
      "python": "def decimal_binary(n):\n    if n == 0:\n        return 0\n    binary = ''\n    while n > 0:\n        remainder = n % 2\n        binary = str(remainder) + binary\n        n //= 2\n    return binary\n\nn = int(input())\nprint(decimal_binary(n))"
    }
  },
  {
    "id": 61,
    "title": "binary to decimal",
    "shortStatement": "Convert a base-2 binary string to a decimal integer.",
    "statement": "Write a program to convert a binary (base-2) string into a decimal (base-10) integer.",
    "sampleInput": "1010",
    "sampleOutput": "10",
    "solutions": {
      "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint binary_decimal(string n) {\n    int decimal = 0;\n    for (char c : n) {\n        decimal = decimal * 2 + (c - '0');\n    }\n    return decimal;\n}\n\nint main() {\n    string n;\n    if (cin >> n) {\n        cout << binary_decimal(n);\n    }\n    return 0;\n}",
      "java": "import java.util.Scanner;\n\nclass Main {\n    public static int binaryDecimal(String n) {\n        int decimal = 0;\n        for (int i = 0; i < n.length(); i++) {\n            decimal = decimal * 2 + (n.charAt(i) - '0');\n        }\n        return decimal;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String n = sc.next();\n            System.out.println(binaryDecimal(n));\n        }\n    }\n}",
      "python": "def binary_decimal(n):\n    decimal = 0\n    for i in n:\n        decimal = decimal * 2 + int(i)\n    return decimal\n\nn = input()\nprint(binary_decimal(n))"
    }
  },
  {
    "id": 62,
    "title": "Coin change",
    "shortStatement": "Find the minimum number of coins to make a given change amount.",
    "statement": "Given an array of coins values and a target change amount, find the minimum count of coins needed to yield exact change using a greedy algorithm. Returns -1 if change is not possible.",
    "sampleInput": "3\n1 2 5\n11",
    "sampleOutput": "3",
    "solutions": {
      "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint greedy_change(vector<int>& coins, int amount) {\n    sort(coins.rbegin(), coins.rend());\n    int count = 0;\n    for (int coin : coins) {\n        while (amount >= coin) {\n            amount -= coin;\n            count++;\n        }\n    }\n    return amount == 0 ? count : -1;\n}\n\nint main() {\n    int n, amount;\n    if (cin >> n) {\n        vector<int> coins(n);\n        for (int i = 0; i < n; i++) cin >> coins[i];\n        cin >> amount;\n        int ans = greedy_change(coins, amount);\n        if (ans == -1) cout << \"No exact change possible\";\n        else cout << ans;\n    }\n    return 0;\n}",
      "java": "import java.util.*;\n\nclass Main {\n    public static int greedyChange(int[] coins, int amount) {\n        Arrays.sort(coins);\n        int count = 0;\n        for (int i = coins.length - 1; i >= 0; i--) {\n            while (amount >= coins[i]) {\n                amount -= coins[i];\n                count++;\n            }\n        }\n        return amount == 0 ? count : -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] coins = new int[n];\n            for (int i = 0; i < n; i++) coins[i] = sc.nextInt();\n            int amount = sc.nextInt();\n            int ans = greedyChange(coins, amount);\n            if (ans == -1) System.out.println(\"No exact change possible\");\n            else System.out.println(ans);\n        }\n    }\n}",
      "python": "def greedy_change(coins, amount):\n    coins.sort(reverse=True)\n    result = []\n    for coin in coins:\n        while amount >= coin:\n            amount -= coin\n            result.append(coin)\n    return len(result) if amount == 0 else \"No exact change possible\"\n\ncoins = [1,2,5]\nprint(greedy_change(coins, 11))"
    }
  },
  {
    "id": 63,
    "title": "Valid parenthesis",
    "shortStatement": "Check if bracket characters are properly matched in pairs.",
    "statement": "Given a string containing bracket characters '(', ')', '[', ']', '{', '}', verify if the brackets are balanced and correctly matched.",
    "sampleInput": "(]{)",
    "sampleOutput": "false",
    "solutions": {
      "cpp": "#include <iostream>\n#include <string>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\n\nstring valid_parenthesis(string p) {\n    stack<char> st;\n    unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};\n    for (char c : p) {\n        if (c == '(' || c == '[' || c == '{') {\n            st.push(c);\n        } else if (c == ')' || c == ']' || c == '}') {\n            if (st.empty() || st.top() != pairs[c]) return \"false\";\n            st.pop();\n        }\n    }\n    return st.empty() ? \"true\" : \"false\";\n}\n\nint main() {\n    string s;\n    if (cin >> s) {\n        cout << valid_parenthesis(s);\n    }\n    return 0;\n}",
      "java": "import java.util.*;\n\nclass Main {\n    public static String validParenthesis(String p) {\n        Stack<Character> stack = new Stack<>();\n        Map<Character, Character> pairs = new HashMap<>();\n        pairs.put(')', '(');\n        pairs.put(']', '[');\n        pairs.put('}', '{');\n        for (char c : p.toCharArray()) {\n            if (c == '(' || c == '[' || c == '{') {\n                stack.push(c);\n            } else if (c == ')' || c == ']' || c == '}') {\n                if (stack.isEmpty() || stack.pop() != pairs.get(c)) {\n                    return \"false\";\n                }\n            }\n        }\n        return stack.isEmpty() ? \"true\" : \"false\";\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(validParenthesis(s));\n        }\n    }\n}",
      "python": "def valid_parenthesis(p):\n    stack = []\n    pairs = {')': '(', ']': '[', '}': '{'}\n    for char in p:\n        if char in \"([{\":\n            stack.append(char)\n        elif char in \")]}\":\n            if not stack or stack.pop() != pairs[char]:\n                return 'false'\n    return 'true' if not stack else 'false'\n\ns = '(]{)'\nprint(valid_parenthesis(s))"
    }
  }
];

// Append new questions
const mergedQuestions = [...questions, ...newQuestions];

// Write back to important_questions.json
fs.writeFileSync(questionsPath, JSON.stringify(mergedQuestions, null, 2), 'utf8');
console.log(`Successfully compiled and wrote ${mergedQuestions.length} important questions to important_questions.json.`);
